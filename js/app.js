(function() {
  var announce_view_loaded, app, init_components, set_title_and_announce_page_load, site_title;

  app = angular.module("modern_a11y", ["ngRoute"]);

  app.config([
    "$routeProvider", function($routeProvider) {
      return $routeProvider.when("/", {
        templateUrl: "home.html",
        controller: "PageCtrl"
      }).when("/contact", {
        templateUrl: "contact.html",
        controller: "PageCtrl"
      }).when("/blog/:post_name", {
        templateUrl: function(params) {
          return '/articles/' + params.post_name;
        },
        controller: "PageCtrl"
      }).when("/faq", {
        templateUrl: "faq.html",
        controller: "PageCtrl"
      }).when("/about", {
        templateUrl: "about.html",
        controller: "PageCtrl"
      }).when("/services", {
        templateUrl: "services.html",
        controller: "PageCtrl"
      }).when("/blog", {
        templateUrl: "blog.html",
        controller: "PageCtrl"
      }).when("/blog/post", {
        templateUrl: "blog_item.html",
        controller: "PageCtrl"
      }).otherwise("/404", {
        templateUrl: "home.html",
        controller: "PageCtrl"
      });
    }
  ]);

  app.controller("PageCtrl", function($scope, $location, $http) {
    $scope.$on('$viewContentLoaded', announce_view_loaded);
    $scope.$on('$viewContentLoaded', init_components);
  });

  site_title = 'Modern Accessibility - ';

  announce_view_loaded = function() {
    var page_title, page_title_el;
    page_title_el = $('main [data-page-title]');
    if (page_title_el != null) {
      page_title = page_title_el.data('page-title') || page_title_el.html();
    } else {
      page_title('page title not set');
    }
    return set_title_and_announce_page_load(page_title);
  };

  init_components = function() {
    return $('[data-drop-down]').each(function() {
      var container;
      container = $(this);
      if (!container.data('drop-down')) {
        return container.dropdown();
      }
    });
  };

  set_title_and_announce_page_load = function(page_title) {
    page_title = site_title + page_title;
    $('title').html(page_title);
    $.announce(page_title + ' page loaded', 'assertive');
  };

}).call(this);

(function() {
  var Modal_Manager;

  Modal_Manager = {
    overlay: null,
    modal_active: false,
    open_button: '[data-opens-modal]',
    close_button: '[data-closes-modal]',
    init: function() {
      var update_position, _self;
      _self = this;
      update_position = function() {
        return _self.position();
      };
      this.content_shell = $('[data-isolate]');
      if (!this.overlay) {
        this.overlay = $('<div class="hidden" id="modal_overlay"></div>').appendTo('body');
      }
      $('body').on('click.modal_open', _self.open_button, $.proxy(this.handle_click_open, _self));
      $('body').on('click.modal_close', _self.close_button, $.proxy(this.handle_click_close, _self));
      $('body').on('keyup.modal_close', $.proxy(this.handle_keypress, _self));
      $.subscribe($.events.window_resize, update_position);
    },
    handle_click_open: function(e) {
      if (this.modal_active) {
        return;
      }
      this.modal_active = true;
      this.modal_id = $(e.target).data('opens-modal');
      this.shell = $('[data-modal-id="' + this.modal_id + '"]');
      this.open();
    },
    handle_click_close: function(e) {
      if (!this.modal_active) {
        return;
      }
      if ($(e.target).is('[data-closes-modal]')) {
        this.close();
      }
    },
    handle_keypress: function(e) {
      var key;
      key = e.keyCode;
      if (key === 27) {
        if (!this.modal_active) {
          return;
        }
        this.close();
      }
    },
    open: function() {
      this.isolate();
      this.label_shell();
      this.shell.removeClass('hidden');
      this.overlay.removeClass('hidden');
      this.shell.access();
      this.position();
    },
    close: function() {
      var lastly, _self;
      _self = this;
      lastly = function() {
        _self.modal_active = false;
        $('[data-opens-modal="' + _self.modal_id + '"]').focus();
        return this.shell = null;
      };
      this.isolate(true);
      this.shell.addClass('hidden');
      this.overlay.addClass('hidden');
      setTimeout(lastly, 0);
    },
    position: function() {
      var height, pos, width, window_height, window_width;
      if (this.shell == null) {
        return;
      }
      this.shell.addClass('testing');
      width = this.shell.width();
      height = this.shell.height();
      window_width = $(window).width();
      window_height = $(window).height();
      this.shell.removeClass('testing');
      pos = {};
      pos.left = ((window_width - width) / 2) + 'px';
      pos.top = ((window_height - height) / 2) + 'px';
      return this.shell.css(pos);
    },
    label_shell: function() {
      var label_ids, labels;
      if (!this.shell.is('[aria-labelledby]')) {
        labels = this.shell.find('[data-modal-label]');
        label_ids = [];
        labels.each(function() {
          var id, label;
          label = $(this);
          id = 'modal_label_' + $.get_guid();
          label.attr('id', id);
          label_ids.push(id);
          return label.removeAttr('data-modal-label');
        });
        this.shell.attr('aria-labelledby', label_ids.join(' '));
      }
    },
    isolate: function(close) {
      var handle_focusin_body, _self;
      _self = this;
      handle_focusin_body = function(e) {
        if (!$(e.target).parents('[data-modal-id]').length) {
          _self.shell.find(':focusable').focus();
        }
      };
      if (close) {
        this.content_shell.removeAttr('aria-hidden');
        $('body').off('.tabfence');
      } else {
        this.content_shell.attr('aria-hidden', true);
        $('body').on('focusin.tabfence', handle_focusin_body);
      }
    }
  };

  $(function() {
    var modal_mgr;
    modal_mgr = Object.create(Modal_Manager);
    return modal_mgr.init();
  });

}).call(this);

(function() {
  var Tooltip_Manager;

  Tooltip_Manager = {
    overlay: null,
    tooltip_active: false,
    open_button: '[data-opens-tooltip]',
    init: function() {
      var _self;
      _self = this;
      $('body').on('focusin.tooltip_open, mouseenter', this.open_button, $.proxy(this.handle_open, _self));
      $('body').on('focusout.tooltip_open, mouseout', this.open_button, $.proxy(this.handle_close, _self));
    },
    handle_open: function(e) {
      if (this.tooltip_active) {
        return;
      }
      this.tooltip_id = $(e.target).data('opens-tooltip');
      this.shell = $('[data-tooltip-id="' + this.tooltip_id + '"]');
      this.open();
    },
    handle_close: function(e) {
      if (!this.tooltip_active) {
        return;
      }
      if (!$(e.target).is('[data-tooltip-id]')) {
        this.close();
      }
    },
    handle_keypress: function(e) {
      var key;
      key = e.keyCode;
      if (key === 27) {
        if (this.shell.is('.hidden')) {
          return;
        }
        this.close();
      }
    },
    open: function() {
      this.position();
      this.shell.removeClass('hidden');
      this.tooltip_active = true;
    },
    close: function() {
      var lastly, _self;
      _self = this;
      lastly = function() {
        return _self.tooltip_active = false;
      };
      this.shell.addClass('hidden');
      setTimeout(lastly, 0);
    },
    position: function() {
      var b_height, b_width, button, pos, position, t_height, t_width;
      this.shell.addClass('testing');
      button = $('[data-opens-tooltip="' + this.tooltip_id + '"]');
      position = button.position();
      b_width = button.outerWidth();
      b_height = button.outerHeight();
      t_width = this.shell.outerWidth();
      t_height = this.shell.outerHeight();
      console.log(t_height);
      pos = {};
      pos.top = Math.floor(position.top - t_height - 10) + 'px';
      pos.left = (position.left + (b_width - t_width) / 2) + 'px';
      this.shell.css(pos);
      this.shell.removeClass('testing');
    },
    label: function(label, labelled) {
      var label_ids, labels;
      if (!this.shell.is('[aria-labelledby]')) {
        labels = this.shell.find('[data-modal-label]');
        label_ids = [];
        labels.each(function() {
          var id;
          label = $(this);
          id = 'modal_label_' + $.get_guid();
          label.attr('id', id);
          return label_ids.push(id);
        });
        this.shell.attr('aria-labelledby', label_ids.join(' '));
      }
    }
  };

  $(function() {
    var tooltip_mgr;
    tooltip_mgr = Object.create(Tooltip_Manager);
    return tooltip_mgr.init();
  });

}).call(this);

(function() {
  var DropDown,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  DropDown = (function() {
    var array_of_keys, keys;

    keys = {
      arrow_up: 38,
      arrow_down: 40,
      enter: 13,
      esc: 27,
      space_bar: 32,
      tab: 9
    };

    array_of_keys = $.map(keys, function(value, key) {
      return value;
    });

    function DropDown(house) {
      var guid;
      this.house = house;
      this.check_if_menu_should_collapse = __bind(this.check_if_menu_should_collapse, this);
      this.move_focus = __bind(this.move_focus, this);
      this.navigate_via_keyboard = __bind(this.navigate_via_keyboard, this);
      this.choose_menu_item = __bind(this.choose_menu_item, this);
      this.toggle_drop_down_menu = __bind(this.toggle_drop_down_menu, this);
      this.poll_drop_down_menu_items = __bind(this.poll_drop_down_menu_items, this);
      this.drop_down_button = $('[data-drop-down-button]', this.house);
      this.drop_down_menu = $('[data-drop-down-menu]', this.house);
      this.drop_down_elements = $('[data-drop-down-button], [data-drop-down-menu], [data-drop-down-item]', this.house);
      this.poll_drop_down_menu_items();
      guid = $.get_guid(true);
      this.drop_down_button.attr('aria-haspopup', true).attr('aria-owns', "menu_" + guid).attr('aria-expanded', false);
      this.drop_down_menu.attr('id', "menu_" + guid).attr('aria-hidden', true);
      this.drop_down_menu_items.attr('role', 'menuitem').attr('tabindex', -1);
      this.house.on('keydown.dropdown keyup.dropdown', this.navigate_via_keyboard);
      this.drop_down_button.on('click.dropdown', this.toggle_drop_down_menu);
      this.drop_down_menu_items.on('click.dropdown', this.choose_menu_item);
    }

    DropDown.prototype.poll_drop_down_menu_items = function() {
      return this.drop_down_menu_items = $('[data-drop-down-item]:not([data-disabled])', this.drop_down_menu);
    };

    DropDown.prototype.toggle_drop_down_menu = function(event, do_expand) {
      var active_menu_item, target;
      if (do_expand == null) {
        do_expand = this.drop_down_button.attr('aria-expanded').toLowerCase() !== 'true';
      }
      target = $(event.target);
      this.poll_drop_down_menu_items();
      this.drop_down_button.attr('aria-expanded', do_expand);
      this.drop_down_menu.attr('aria-hidden', !do_expand);
      if (do_expand) {
        this.drop_down_button.focus();
        active_menu_item = this.drop_down_menu_items.filter('.active');
        if (active_menu_item.length === 0) {
          active_menu_item = this.drop_down_menu_items.first().addClass('active');
        }
        if (active_menu_item) {
          active_menu_item.focus();
        }
        this.drop_down_button.trigger('expand');
        return $(document).on('activity.dropdown', this.check_if_menu_should_collapse);
      } else {
        $(document).off('activity.dropdown', this.check_if_menu_should_collapse);
        if (this.drop_down_button && (!$(document.activeElement).is(':focusable') || $(document.activeElement).is(this.drop_down_menu_items))) {
          this.drop_down_button.focus();
        }
        return this.drop_down_button.trigger('contract');
      }
    };

    DropDown.prototype.choose_menu_item = function(event) {
      var chosen_menu_item;
      chosen_menu_item = event.type === 'click' ? $(event.currentTarget) : $(event.target);
      this.drop_down_button.find('span').text(chosen_menu_item.text());
      chosen_menu_item.trigger('choose');
      return this.toggle_drop_down_menu(event, false);
    };

    DropDown.prototype.navigate_via_keyboard = function(event) {
      var key_pressed, target;
      target = $(event.target);
      key_pressed = event.which;
      if (!($.inArray(key_pressed, array_of_keys) > -1)) {
        return true;
      }
      if (target.is(this.drop_down_button)) {
        switch (key_pressed) {
          case keys.enter:
          case keys.space_bar:
            if (event.type === 'keyup') {
              this.toggle_drop_down_menu(event);
            }
            return false;
        }
      } else if (target.is(this.drop_down_menu_items)) {
        switch (key_pressed) {
          case keys.esc:
            if (event.type === 'keyup') {
              this.toggle_drop_down_menu(event, false);
              this.drop_down_menu.focus();
            }
            return false;
          case keys.enter:
          case keys.space_bar:
            if (event.type === 'keyup') {
              this.choose_menu_item(event);
            }
            return false;
          case keys.arrow_up:
          case keys.arrow_down:
            if (event.type === 'keyup') {
              this.move_focus(key_pressed === keys.arrow_up ? 'up' : 'down');
            }
            return false;
          case keys.tab:
            return false;
        }
      }
      return true;
    };

    DropDown.prototype.move_focus = function(direction) {
      var current_tab_index, new_tab_index;
      this.poll_drop_down_menu_items();
      current_tab_index = this.drop_down_menu_items.index(document.activeElement);
      new_tab_index = direction === 'up' ? current_tab_index - 1 : current_tab_index + 1;
      if (new_tab_index < 0) {
        new_tab_index = this.drop_down_menu_items.length - 1;
      } else if (new_tab_index >= this.drop_down_menu_items.length) {
        new_tab_index = 0;
      }
      return this.drop_down_menu_items.removeClass('active').eq(new_tab_index).addClass('active').focus();
    };

    DropDown.prototype.check_if_menu_should_collapse = function(event) {
      var active_element, expanded;
      active_element = $(document.activeElement);
      expanded = this.drop_down_button.attr('aria-expanded').toLowerCase() === 'true';
      if (expanded && !active_element.is(this.drop_down_menu_items) && !active_element.is(this.drop_down_button)) {
        return this.toggle_drop_down_menu(event, false);
      }
    };

    $.fn.dropdown = function() {
      if (!$(this).data('drop_down')) {
        $(this).data('drop_down', new DropDown($(this)));
      }
      return this;
    };

    return DropDown;

  })();

}).call(this);

(function() {
  var Throttlr, window_resize, _guid;

  $.events = {
    'window_resize': 'window_resize'
  };

  _guid = 0;

  $.get_guid = function(return_current) {
    if (!return_current) {
      _guid++;
    }
    return _guid;
  };

  (function($) {
    var a;
    a = {};
    $.publish = function(d, c) {
      return a[d] && $.each(a[d], function() {
        if (this.apply) {
          return this.apply($, c || []);
        }
      });
    };
    $.subscribe = function(c, d) {
      if (!a[c]) {
        a[c] = [];
      }
      a[c].push(d);
      return [c, d];
    };
    $.unsubscribe = function(event_name, handler) {
      var counter, registered_handler, _i, _len, _ref, _results;
      if (a[event_name]) {
        counter = 0;
        _ref = a[event_name];
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          registered_handler = _ref[_i];
          if (registered_handler === handler) {
            a[event_name].splice(counter, 1);
          }
          _results.push(counter++);
        }
        return _results;
      }
    };
    return $.subscriptions = a;
  })($);

  Throttlr = {
    dom_event: null,
    timeout: null,
    pubsub_event: null,
    publish_event: function() {
      return $.publish(this.pubsub_event);
    },
    on_event: function() {
      var self_publish_event, self_timeout, _self;
      self_timeout = this.timeout;
      _self = this;
      self_publish_event = function() {
        return _self.publish_event();
      };
      window.clearTimeout(self_timeout);
      return self_timeout = window.setTimeout(self_publish_event, this.timeout);
    },
    init: function(dom_event, publish_event, timeout) {
      var _self;
      this.dom_event = dom_event;
      this.pubsub_event = publish_event;
      this.timeout = timeout;
      _self = this;
      return $(window).on(this.dom_event, $.proxy(this.on_event, _self));
    },
    create: function(dom_event, publish_event, timeout) {
      var instance;
      instance = Object.create(Throttlr);
      return instance.init(dom_event, publish_event, timeout);
    }
  };

  window_resize = Throttlr.create('resize', $.events.window_resize, 100);

}).call(this);
