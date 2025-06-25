"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/use-composed-ref";
exports.ids = ["vendor-chunks/use-composed-ref"];
exports.modules = {

/***/ "(ssr)/./node_modules/use-composed-ref/dist/use-composed-ref.esm.js":
/*!********************************************************************!*\
  !*** ./node_modules/use-composed-ref/dist/use-composed-ref.esm.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ useComposedRef)\n/* harmony export */ });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"(ssr)/./node_modules/next/dist/server/future/route-modules/app-page/vendored/ssr/react.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);\n\n// basically Exclude<React.ClassAttributes<T>[\"ref\"], string>\nvar updateRef = function updateRef(ref, value) {\n    if (typeof ref === \"function\") {\n        ref(value);\n        return;\n    }\n    ref.current = value;\n};\nvar useComposedRef = function useComposedRef(libRef, userRef) {\n    var prevUserRef = react__WEBPACK_IMPORTED_MODULE_0___default().useRef();\n    return react__WEBPACK_IMPORTED_MODULE_0___default().useCallback(function(instance) {\n        libRef.current = instance;\n        if (prevUserRef.current) {\n            updateRef(prevUserRef.current, null);\n        }\n        prevUserRef.current = userRef;\n        if (!userRef) {\n            return;\n        }\n        updateRef(userRef, instance);\n    }, [\n        userRef\n    ]);\n};\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvdXNlLWNvbXBvc2VkLXJlZi9kaXN0L3VzZS1jb21wb3NlZC1yZWYuZXNtLmpzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUEwQjtBQUUxQiw2REFBNkQ7QUFFN0QsSUFBSUMsWUFBWSxTQUFTQSxVQUFVQyxHQUFHLEVBQUVDLEtBQUs7SUFDM0MsSUFBSSxPQUFPRCxRQUFRLFlBQVk7UUFDN0JBLElBQUlDO1FBQ0o7SUFDRjtJQUNBRCxJQUFJRSxPQUFPLEdBQUdEO0FBQ2hCO0FBQ0EsSUFBSUUsaUJBQWlCLFNBQVNBLGVBQWVDLE1BQU0sRUFBRUMsT0FBTztJQUMxRCxJQUFJQyxjQUFjUixtREFBWTtJQUM5QixPQUFPQSx3REFBaUIsQ0FBQyxTQUFVVyxRQUFRO1FBQ3pDTCxPQUFPRixPQUFPLEdBQUdPO1FBQ2pCLElBQUlILFlBQVlKLE9BQU8sRUFBRTtZQUN2QkgsVUFBVU8sWUFBWUosT0FBTyxFQUFFO1FBQ2pDO1FBQ0FJLFlBQVlKLE9BQU8sR0FBR0c7UUFDdEIsSUFBSSxDQUFDQSxTQUFTO1lBQ1o7UUFDRjtRQUNBTixVQUFVTSxTQUFTSTtJQUNyQixHQUFHO1FBQUNKO0tBQVE7QUFDZDtBQUVxQyIsInNvdXJjZXMiOlsid2VicGFjazovL3RpZW5kYWZpeC13ZWIvLi9ub2RlX21vZHVsZXMvdXNlLWNvbXBvc2VkLXJlZi9kaXN0L3VzZS1jb21wb3NlZC1yZWYuZXNtLmpzPzVlMDMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcblxuLy8gYmFzaWNhbGx5IEV4Y2x1ZGU8UmVhY3QuQ2xhc3NBdHRyaWJ1dGVzPFQ+W1wicmVmXCJdLCBzdHJpbmc+XG5cbnZhciB1cGRhdGVSZWYgPSBmdW5jdGlvbiB1cGRhdGVSZWYocmVmLCB2YWx1ZSkge1xuICBpZiAodHlwZW9mIHJlZiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJlZih2YWx1ZSk7XG4gICAgcmV0dXJuO1xuICB9XG4gIHJlZi5jdXJyZW50ID0gdmFsdWU7XG59O1xudmFyIHVzZUNvbXBvc2VkUmVmID0gZnVuY3Rpb24gdXNlQ29tcG9zZWRSZWYobGliUmVmLCB1c2VyUmVmKSB7XG4gIHZhciBwcmV2VXNlclJlZiA9IFJlYWN0LnVzZVJlZigpO1xuICByZXR1cm4gUmVhY3QudXNlQ2FsbGJhY2soZnVuY3Rpb24gKGluc3RhbmNlKSB7XG4gICAgbGliUmVmLmN1cnJlbnQgPSBpbnN0YW5jZTtcbiAgICBpZiAocHJldlVzZXJSZWYuY3VycmVudCkge1xuICAgICAgdXBkYXRlUmVmKHByZXZVc2VyUmVmLmN1cnJlbnQsIG51bGwpO1xuICAgIH1cbiAgICBwcmV2VXNlclJlZi5jdXJyZW50ID0gdXNlclJlZjtcbiAgICBpZiAoIXVzZXJSZWYpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdXBkYXRlUmVmKHVzZXJSZWYsIGluc3RhbmNlKTtcbiAgfSwgW3VzZXJSZWZdKTtcbn07XG5cbmV4cG9ydCB7IHVzZUNvbXBvc2VkUmVmIGFzIGRlZmF1bHQgfTtcbiJdLCJuYW1lcyI6WyJSZWFjdCIsInVwZGF0ZVJlZiIsInJlZiIsInZhbHVlIiwiY3VycmVudCIsInVzZUNvbXBvc2VkUmVmIiwibGliUmVmIiwidXNlclJlZiIsInByZXZVc2VyUmVmIiwidXNlUmVmIiwidXNlQ2FsbGJhY2siLCJpbnN0YW5jZSIsImRlZmF1bHQiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/use-composed-ref/dist/use-composed-ref.esm.js\n");

/***/ })

};
;