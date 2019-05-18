webpackHotUpdate("static/development/pages/texture.js",{

/***/ "./components/Header.js":
/*!******************************!*\
  !*** ./components/Header.js ***!
  \******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Header; });
/* harmony import */ var _babel_runtime_corejs2_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime-corejs2/helpers/esm/classCallCheck */ "./node_modules/@babel/runtime-corejs2/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_corejs2_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime-corejs2/helpers/esm/createClass */ "./node_modules/@babel/runtime-corejs2/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_corejs2_helpers_esm_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime-corejs2/helpers/esm/possibleConstructorReturn */ "./node_modules/@babel/runtime-corejs2/helpers/esm/possibleConstructorReturn.js");
/* harmony import */ var _babel_runtime_corejs2_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime-corejs2/helpers/esm/getPrototypeOf */ "./node_modules/@babel/runtime-corejs2/helpers/esm/getPrototypeOf.js");
/* harmony import */ var _babel_runtime_corejs2_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime-corejs2/helpers/esm/inherits */ "./node_modules/@babel/runtime-corejs2/helpers/esm/inherits.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! next/link */ "./node_modules/next/link.js");
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(next_link__WEBPACK_IMPORTED_MODULE_6__);









function SubstanceLogo(props) {
  return react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", {
    className: 'sc-substance-logo ' + (props.inverted ? 'sm-inverted' : '')
  }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement(next_link__WEBPACK_IMPORTED_MODULE_6___default.a, {
    href: "/"
  }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("a", null, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("img", {
    src: "/static/images/substance-logo.svg",
    height: "30"
  }))));
}

function SubstanceMenu(props) {
  return react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", {
    className: "sc-menu"
  }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", {
    className: "sc-menu-link"
  }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("a", {
    href: "#",
    className: 'se-menu-link' + (props.activeMenu === 'products' ? 'sm-active' : '')
  }, "Products"), react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", {
    className: "sc-menu-popover"
  }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", {
    className: "se-nav-header"
  }, "Products"), react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", {
    className: "se-nav-item"
  }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement(next_link__WEBPACK_IMPORTED_MODULE_6___default.a, {
    href: "/texture"
  }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("a", null, "Texture"))), react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", {
    className: "se-nav-item"
  }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement(next_link__WEBPACK_IMPORTED_MODULE_6___default.a, {
    href: "/dar"
  }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("a", null, "DAR"))), react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", {
    className: "se-nav-item"
  }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement(next_link__WEBPACK_IMPORTED_MODULE_6___default.a, {
    href: "https://github.com/substance/substance"
  }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("a", null, "Substance.js"))))), react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", {
    className: "sc-menu-link"
  }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("a", {
    href: "#",
    className: 'se-menu-link' + (props.activeMenu === 'solutions' ? 'sm-active' : '')
  }, "Solutions"), react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", {
    className: "sc-menu-popover"
  }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", {
    className: "se-nav-header"
  }, "Solutions"), react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", {
    className: "se-nav-item"
  }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement(next_link__WEBPACK_IMPORTED_MODULE_6___default.a, {
    href: "/publishing"
  }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("a", null, "Journal Publishing"))), react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", {
    className: "se-nav-item"
  }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement(next_link__WEBPACK_IMPORTED_MODULE_6___default.a, {
    href: "/repro-docs"
  }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("a", null, "Reproducible Documents"))))), react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", {
    class: "sc-menu-link"
  }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement(next_link__WEBPACK_IMPORTED_MODULE_6___default.a, {
    href: "/story"
  }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("a", {
    className: 'se-menu-link' + (props.activeMenu === 'our-story' ? 'sm-active' : '')
  }, "Our Story"))), react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", {
    class: "sc-menu-link"
  }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement(next_link__WEBPACK_IMPORTED_MODULE_6___default.a, {
    href: "/contact"
  }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("a", {
    className: 'se-menu-link' + (props.activeMenu === 'contact' ? 'sm-active' : '')
  }, "Contact"))));
}

function SubstanceMobileMenu() {
  return react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", {
    className: "sc-menu"
  }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", {
    className: "se-first-row sm-columns"
  }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", {
    className: "se-col"
  }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", {
    className: "se-nav-header"
  }, "Products"), react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", {
    className: "se-nav-item"
  }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement(next_link__WEBPACK_IMPORTED_MODULE_6___default.a, {
    href: "/texture"
  }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("a", null, "Texture"))), react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", {
    className: "se-nav-item"
  }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement(next_link__WEBPACK_IMPORTED_MODULE_6___default.a, {
    href: "/dar"
  }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("a", null, "DAR"))), react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", {
    className: "se-nav-item"
  }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement(next_link__WEBPACK_IMPORTED_MODULE_6___default.a, {
    href: "https://github.com/substance/substance"
  }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("a", null, "Substance.js")))), react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", {
    className: "se-col"
  }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", {
    className: "se-nav-header"
  }, "Solutions"), react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", {
    className: "se-nav-item"
  }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement(next_link__WEBPACK_IMPORTED_MODULE_6___default.a, {
    href: "/publishing"
  }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("a", null, "Journal Publishing"))), react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", {
    className: "se-nav-item"
  }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement(next_link__WEBPACK_IMPORTED_MODULE_6___default.a, {
    href: "/repro-docs"
  }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("a", null, "Reproducible Documents"))))), react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", {
    className: "sm-divider"
  }), react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", {
    className: "se-second-row sm-columns"
  }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", {
    className: "se-col"
  }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", {
    className: "se-nav-item"
  }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement(next_link__WEBPACK_IMPORTED_MODULE_6___default.a, {
    href: "/story"
  }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("a", null, "Our Story"))), react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", {
    className: "se-nav-item"
  }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement(next_link__WEBPACK_IMPORTED_MODULE_6___default.a, {
    href: "/terms"
  }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("a", null, "Terms")))), react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", {
    className: "se-col"
  }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", {
    className: "se-nav-item"
  }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement(next_link__WEBPACK_IMPORTED_MODULE_6___default.a, {
    href: "/contact"
  }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("a", null, "Contact"))), react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", {
    className: "se-nav-item"
  }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement(next_link__WEBPACK_IMPORTED_MODULE_6___default.a, {
    href: "/privacy"
  }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("a", null, "Privacy"))))));
}

var Header =
/*#__PURE__*/
function (_Component) {
  Object(_babel_runtime_corejs2_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_4__["default"])(Header, _Component);

  function Header() {
    var _this;

    Object(_babel_runtime_corejs2_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, Header);

    _this = Object(_babel_runtime_corejs2_helpers_esm_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_2__["default"])(this, Object(_babel_runtime_corejs2_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_3__["default"])(Header).call(this));
    _this.state = {
      expanded: false
    };
    return _this;
  }

  Object(_babel_runtime_corejs2_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(Header, [{
    key: "toggleMobileMenu",
    value: function toggleMobileMenu() {
      var expanded = this.state.expanded;
      this.setState({
        expanded: !expanded
      });
    }
  }, {
    key: "render",
    value: function render() {
      var props = this.props,
          state = this.state;
      return react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", {
        className: 'sc-header ' + (state.expanded ? 'sm-expanded' : '')
      }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", {
        className: "se-header-container"
      }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", {
        className: "se-header-navbar"
      }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement(SubstanceLogo, {
        inverted: state.expanded
      }), react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", {
        className: "sm-spacer"
      }), props.isMobile ? react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", {
        className: "se-hamburger",
        onClick: this.toggleMobileMenu.bind(this)
      }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("i", {
        className: "fa fa-bars"
      })) : react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement(SubstanceMenu, {
        activeMenu: props.activeMenu
      })), function () {
        if (state.expanded) {
          return react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement(SubstanceMobileMenu, {
            activeMenu: props.activeMenu
          });
        }
      }()));
    }
  }]);

  return Header;
}(react__WEBPACK_IMPORTED_MODULE_5__["Component"]);



/***/ })

})
//# sourceMappingURL=texture.js.0d8b359523b99b3b370a.hot-update.js.map