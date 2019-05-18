webpackHotUpdate("static/development/pages/repro-docs.js",{

/***/ "./pages/repro-docs.js":
/*!*****************************!*\
  !*** ./pages/repro-docs.js ***!
  \*****************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ReproDocs; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/link */ "./node_modules/next/link.js");
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_link__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _components_Layout__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/Layout */ "./components/Layout.js");
/* harmony import */ var _components_Body__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../components/Body */ "./components/Body.js");
/* harmony import */ var _components_Section__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../components/Section */ "./components/Section.js");
/* harmony import */ var _components_Teaser__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../components/Teaser */ "./components/Teaser.js");
/* harmony import */ var _components_List__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../components/List */ "./components/List.js");
/* harmony import */ var _components_ReadMore__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../components/ReadMore */ "./components/ReadMore.js");








function ReproDocs() {
  return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_components_Layout__WEBPACK_IMPORTED_MODULE_2__["default"], {
    title: "Reproducible documents"
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_components_Teaser__WEBPACK_IMPORTED_MODULE_5__["default"], {
    title: "Reproducible documents",
    headline: "Realising reproducible documents with Texture and Stencila."
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
    className: "se-teaser-image"
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("img", {
    className: "se-image",
    src: "/static/images/reproducable-manuscript.png"
  }))), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_components_Body__WEBPACK_IMPORTED_MODULE_3__["default"], null, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_components_Section__WEBPACK_IMPORTED_MODULE_4__["default"], {
    headline: "Adding reproducibility to the academic manuscript"
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("p", null, "In science calls for transparency and reproducibility are becoming louder. Researchers want to share not only their final findings but the underlying data and the methods used to generate the results."), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("p", null, "Substance in collaboration with eLife and Stencila is addressing this by enabling reproducible elements in the Texture editor with the following goals in mind.")), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_components_Section__WEBPACK_IMPORTED_MODULE_4__["default"], null, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_components_List__WEBPACK_IMPORTED_MODULE_6__["List"], null, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_components_List__WEBPACK_IMPORTED_MODULE_6__["ListItem"], {
    headline: "Source data"
  }, "Source data is readily available in the publication and can be explored by the reader."), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_components_List__WEBPACK_IMPORTED_MODULE_6__["ListItem"], {
    headline: "Code cells"
  }, "Code cells allow live computations right in the document authoring environment and reveal the scientific methods used."), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_components_List__WEBPACK_IMPORTED_MODULE_6__["ListItem"], {
    headline: "Reproducible figures"
  }, "The code and data used to generate a figure can be revealed and changed."))), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_components_Section__WEBPACK_IMPORTED_MODULE_4__["default"], {
    headline: "An open standard for representing reproducible research documents"
  }, "The creation of an open standard for the exchange, submission and publication of reproducible documents is critical for widespread adoption by academic publishers, and will be beneficial for the discovery and persistence of research reported in this form. Therefore, Substance in collaboration with Stencila is developing an extension to the ", react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(next_link__WEBPACK_IMPORTED_MODULE_1___default.a, {
    href: "/dar"
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("a", null, "DAR")), " format, which will allow the data, code and computed outputs (graphs, statistical results, tables) embedded in a reproducible document to be recognised and presented online as an enhanced version of the published research article. In order to do this, we are representing these assets in JATS XML, the publishing standard through which research manuscripts are processed through the publishing workflow."), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_components_Section__WEBPACK_IMPORTED_MODULE_4__["default"], {
    headline: "Stencila"
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(next_link__WEBPACK_IMPORTED_MODULE_1___default.a, {
    href: "https://stenci.la/"
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("a", null, "Stencila")), " is an open source platform, which provides easy-to-access computation environments for reproducible documents in the ", react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(next_link__WEBPACK_IMPORTED_MODULE_1___default.a, {
    href: "/dar"
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("a", null, "DAR")), " format. Stencila makes reproducibility an integral part of a research publication (with live code execution) rather than attaching supplementary programming notebooks. Stencila however is capable of reading and writing existing well-established notebook formats such as Jupyter, RMarkdown etc."), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_components_Section__WEBPACK_IMPORTED_MODULE_4__["default"], {
    headline: "Stencila in Texture"
  }, "Substance is developing a Stencila plugin for Texture, which enables reproducible content types in the editor. It provides a seamless editing experience for both regular text and source code."), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_components_Section__WEBPACK_IMPORTED_MODULE_4__["default"], {
    headline: "Learn more"
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_components_ReadMore__WEBPACK_IMPORTED_MODULE_7__["default"], {
    href: "https://www.nature.com/articles/d41586-019-00724-7",
    title: "Pioneering \u2018live-code\u2019 article allows scientists to play with each other\u2019s results"
  }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_components_ReadMore__WEBPACK_IMPORTED_MODULE_7__["default"], {
    href: "https://elifesciences.org/labs/ad58f08d/introducing-elife-s-first-computationally-reproducible-article",
    title: "Introducing eLife\u2018s first computationally reproducible research"
  }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_components_ReadMore__WEBPACK_IMPORTED_MODULE_7__["default"], {
    href: "https://elifesciences.org/labs/7dbeb390/reproducible-document-stack-supporting-the-next-generation-research-article",
    title: "Reproducible Document Stack - supporting the next generation research article"
  }))));
}

/***/ })

})
//# sourceMappingURL=repro-docs.js.698d975ae82cac7cda5e.hot-update.js.map