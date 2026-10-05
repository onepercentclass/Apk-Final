/**
 * N6 view - client
 *
 * The markup that used to sit inside <body> in client.html, kept byte for byte.
 * Nothing was renamed, reordered or removed. The tier gate in js/core/access.js
 * works purely off the data-panel / data-client-tab attributes that already exist
 * on the navigation elements.
 *
 * Original <body> tag: <body>
 */

export const BODY_ATTR = '<body>';

export const VIEW_CLIENT = `

<div id="root"></div>
<div id="printArea"></div>


<!-- N6: script block moved to js/modules/client + js/dist/client.js -->

`;

export default VIEW_CLIENT;
