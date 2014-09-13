// Create our Application
(function() {

    // Default subreddits to include
    var defaultSubreddits = [
        "Gunners", 'funny', 'emberjs', 'node'
    ];

    window.App = Ember.Application.create({});

    App.Page = Ember.Object.extend({});
    App.Page.reopenClass({
        find: function(id) {
            if (id) {
                return Em.Deferred.promise(function(p) {
                    p.resolve($.get("page/"+id+".html").then(function(response) {
                        return {
                            page: response
                        };
                    }));
                });
            } else {
                return null;
            }
        }
    });
    App.Markdown = Ember.Object.extend({});
    App.Markdown.reopenClass({
        find: function(id) {
            if (id) {
                return Em.Deferred.promise(function(p) {
                    p.resolve($.get("page/"+id+".md").then(function(response) {
                        return {
                            page: marked(response)
                        };
                    }));
                });
            } else {
                return null;
            }
        }
    });

    App.Subreddit = Ember.Object.extend({
        loadedLinks: false,

        title: function() {
            return "/r/" + this.get('id');
        }.property('id'),

        /*
      Load the links associated with this subreddit.

      It returns a promise that will resolve to be the list of links from reddit. A special case is that
      if we've already loaded the links, we resolve to that right away rather than loading them a second
      time.
    */
        loadLinks: function() {
            var subreddit = this;
            //this.controllerFor('application').set('title', this.get('title'));

            return Em.Deferred.promise(function(p) {
                if (subreddit.get('loadedLinks')) {
                    // We've already loaded the links, let's return them!
                    p.resolve(subreddit.get('links'));
                } else {

                    // If we haven't loaded the links, load them via JSON
                    p.resolve($.getJSON("http://www.reddit.com/r/" + subreddit.get('id') + "/.json?jsonp=?").then(function(response) {
                        var links = Em.A();
                        response.data.children.forEach(function(child) {
                            child.data.subreddit = subreddit;
                            links.pushObject(App.Link.create(child.data));
                        });
                        subreddit.setProperties({
                            links: links,
                            loadedLinks: true
                        });
                        return links;
                    }));
                }
            });
        },

        findLinkById: function(id) {
            return this.loadLinks().then(function(links) {
                return links.findProperty('id', id);
            });
        }

    });

    /*
     Note: `reopenClass` sounds scary but it's pretty simple. We're just defining class level methods
     instead of instance methods. That way we can say `App.Subreddit.list()` to get a list of
     subreddits.
  */
    App.Subreddit.reopenClass({

        /*
      This class method returns a list of all our subreddits. We store them in a class variable
      so they will only be created and referenced once.
    */
        list: function(id) {
            // If we've already loaded the list, return it
            if (this._list) {
                return this._list;
            }

            var list = Em.A();
            defaultSubreddits.forEach(function(id) {
                list.pushObject(App.Subreddit.create({
                    id: id
                }));
            });

            // Remember what we've created so we don't request it twice.
            this._list = list;
            return list;
        },

        /*
      Returns the default subreddit to show if the user hasn't selected one.
    */
        defaultSubreddit: function() {
            return this.list()[0];
        }

    });

    // Our Link model
    App.Link = Ember.Object.extend({
        /*
      It seems reddit will return the string "default" or "self" when there's no thumbnail
      present.

      This computed property will convert "default" or "self" to null to avoid rendering a broken
      image link.
    */
        thumbnailUrl: function() {
            var thumbnail = this.get('thumbnail');
            return ((thumbnail === 'default') || (thumbnail === 'self')) ? null : thumbnail;
        }.property('thumbnail'),
        image: function() {
            var url = this.get('url');
            if (!url) {
                return false;
            }
            if (url.match(/\.(jpeg|jpg|gif|png)$/) !== null) {
                return true;
            }
            if (url.match(/imgur\.com\//) !== null) {
                return true;
            }
            return false;
        }.property('url'),
        embed: function() {
            var result = this.get('media_embed.content');
            if (!result) return null;

            return result.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
        }.property('media_embed.content'),
        outlink: function() {
            var result = this.get('media_embed.content');
            if (!!result) return false;
            var url = this.get('url');
            if (!url) {
                return true;
            }
            if (url.match(/\.(jpeg|jpg|gif|png)$/) !== null) {
                return false;
            }
            if (url.match(/imgur\.com\//) !== null) {
                return false;
            }
            return true;
        }.property('url', 'media_embed.content'),
        imageUrl: function() {
            var url = this.get('url');
            if (!url) return false;
            if (url.match(/imgur\.com\//) !== null) return url + ".jpg";
            return url;
        }.property('url')

    });

    // Routes below
    App.Router.map(function() {
        this.resource("subreddit", {
            path: "/r/:subreddit_id"
        }, function() {
            this.resource('link', {
                path: '/:link_id'
            });
        });
        this.resource("markdown", {
            path: "/page/md/:page_id"
        });
        this.resource("page", {
            path: "/page/html/:page_id"
        });
    });

    App.PageRoute = Ember.Route.extend({
        model: function(params) {
            return App.Page.find(params.page_id);
        }
    });
    App.MarkdownRoute = Ember.Route.extend({
        model: function(params) {
            return App.Markdown.find(params.page_id);
        }
    });
    App.LinkRoute = Ember.Route.extend({
        model: function(params) {
            return this.modelFor('subreddit').findLinkById(params.link_id);
        },
        afterModel: function(model) {
            this.controllerFor('application').set('subTitle', model.get('title'));

            return model;
        },
        deactivate: function() {
            this.controllerFor('application').set('subTitle', "");
        }
    });

    App.SubredditRoute = Ember.Route.extend({
        model: function(params) {
            return App.Subreddit.list().findProperty('id', params.subreddit_id);
        },
        afterModel: function(model) {
            this.controllerFor('application').set('title', model.get('title'));
            model.set('subreddits', App.Subreddit.list());
            return model.loadLinks();
        }
    });

    App.ApplicationView = Ember.View.extend({
        didInsertElement: function() {
            var controller = this.get('controller');
            // Attach the `keyup` event to the body element, to transition back to the subreddit's index
            // when the escape key is pressed.
            $('body').on('keyup', function(event) {
                if (event.keyCode !== 27) {
                    return;
                }
                controller.transitionToRoute('subreddit');
            });
        }
    });

    App.ApplicationRoute = Ember.Route.extend({
        setupController: function(controller) {
            // `controller` is the instance of ApplicationController
            controller.set('subreddits', App.Subreddit.list());
        },
        actions: {
            loading: function() {
                NProgress.start();
                //var view = this.container.lookup('view:loading').append();
                this.router.one('didTransition', NProgress, 'done');
            }
        }
    });
    App.ApplicationController = Ember.Controller.extend({
        title: 'subreddits',
        subTitle: ''
    });


    App.IndexRoute = Ember.Route.extend({
        redirect: function() {
            this.transitionTo('page', "index");
        }
    });

})();
