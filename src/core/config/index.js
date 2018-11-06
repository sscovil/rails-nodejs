"use strict";

module.exports = {
  actionNames: [
    "create",
    "delete",
    "edit",
    "find",
    "index",
    "list",
    "new",
    "show",
    "update"
  ],
  seedDirectories: [
    "app",
    "app/assets",
    "app/assets/images",
    "app/assets/fonts",
    "app/assets/javascripts",
    "app/assets/stylesheets",
    "app/controllers",
    "app/helpers",
    "app/jobs",
    "app/mailers",
    "app/models",
    "app/views",
    "app/views/layouts",
    "bin",
    "config",
    "db",
    "lib",
    "logs",
    "public",
    "test",
    "test/controllers",
    "test/fixtures",
    "test/integration",
    "test/jobs",
    "test/mailers",
    "test/models",
    "tmp"
  ],
  templates: {
    editorConfig: `
    # http://editorconfig.org
    root = true

    [*]
    charset = utf-8
    end_of_line = lf
    indent_size = 2
    indent_style = space
    insert_final_newline = true
    max_line_length = 80
    trim_trailing_whitespace = true
    `,
    errors: {
      routing: (err, msg) => `
      <!doctype html>
      <html>
        <head>
          <title>Controller: Exception</title>

          <style type="text/css" media="screen">
            body {
              margin: 0;
              margin-bottom: 25px;
              padding: 0;
              background-color: #f0f0f0;
              font-family: "Lucida Grande", "Bitstream Vera Sans", "Verdana";
              font-size: 13px;
              color: #333;
            }

            header {
              width: 100%;
              color: #f0f0f0;
              background: #44883e;
              padding: 0.5em 1.5em;
            }

            header h1 {
              margin: 0.2em 0;
              line-height: 1.1em;
              font-size: 2em;
            }

            main h2 {
              color: #44883e;
              padding: 0 1.5em;
            }
          </style>
        </head>
        <body>
          <header>
            <h1>${err}</h1>
          </header>

          <main>
            <h2>${msg}</h2>
          </main>
        </body>
      </html>
      `
    },
    welcome: `
    <!doctype html>
    <html>
      <head>
        <title>NodeJS on Rails: Welcome aboard</title>

        <style type="text/css" media="screen">
          body {
            margin: 0;
            margin-bottom: 25px;
            padding: 0;
            background-color: #f0f0f0;
            font-family: "Lucida Grande", "Bitstream Vera Sans", "Verdana";
            font-size: 13px;
            color: #333;
          }

          #page {
            background-color: #f0f0f0;
            width: 750px;
            margin: 0;
            margin-left: auto;
            margin-right: auto;
          }

          #content {
            float: left;
            background-color: white;
            border: 3px solid #aaa;
            border-top: none;
            padding: 25px;
            width: 500px;
          }

          .filename {
            font-style: italic;
          }

          header {
            /*
            background-image: url(data:image/png;base64,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);
            */
            background-repeat: no-repeat;
            background-position: top left;
            height: 64px;
            padding-left: 75px;
            padding-right: 30px;
          }

          header h1 {
            margin: 0;
          }

          header h2 {
            margin: 0;
            color: #888;
            font-weight: normal;
            font-size: 16px;
          }

          #about {
            padding-left: 75px;
            padding-right: 30px;
          }

          #about h3 {
            margin: 0;
            margin-bottom: 10px;
            font-size: 14px;
          }

          #about-content {
            background-color: #ffd;
            border: 1px solid #fc0;
            margin-left: -55px;
            margin-right: -10px;
          }

          #about-content table {
            margin-top: 10px;
            margin-bottom: 10px;
            font-size: 11px;
            border-collapse: collapse;
          }

          #about-content td {
            padding: 10px;
            padding-top: 3px;
            padding-bottom: 3px;
          }

          #about-content td.name  {
            font-weight: bold;
            vertical-align: top;
            color: #555;
          }

          #about-content td.value {
            color: #000
          }

          #about-content ul {
            padding: 0;
            list-style-type: none;
          }

          #about-content.failure {
            background-color: #fcc;
            border: 1px solid #f00;
          }

          #about-content.failure p {
            margin: 0;
            padding: 10px;
          }

          #getting-started {
            padding-left: 75px;
            padding-right: 30px;
          }

          #getting-started {
            border-top: 1px solid #ccc;
            margin-top: 25px;
            padding-top: 15px;
          }

          #getting-started h1 {
            margin: 0;
            font-size: 20px;
          }

          #getting-started h2 {
            margin: 0;
            font-size: 14px;
            font-weight: normal;
            color: #333;
            margin-bottom: 25px;
          }

          #getting-started ol {
            margin-left: 0;
            padding-left: 0;
          }

          #getting-started li {
            font-size: 18px;
            color: #888;
            margin-bottom: 25px;
          }

          #getting-started li h2 {
            margin: 0;
            font-weight: normal;
            font-size: 18px;
            color: #333;
          }

          #getting-started li p {
            color: #555;
            font-size: 13px;
          }

          #sidebar {
            float: right;
            width: 175px;
          }

          #sidebar ul {
            margin-left: 0;
            padding-left: 0;
          }

          #sidebar ul h3 {
            margin-top: 25px;
            font-size: 16px;
            padding-bottom: 10px;
            border-bottom: 1px solid #ccc;
          }

          #sidebar li {
            list-style-type: none;
          }

          #sidebar ul.links li {
            margin-bottom: 5px;
          }

          footer {
            clear: both;
          }
        </style>
      </head>
      <body>
        <div id="page">
          <main id="content">
            <header>
              <h1>Welcome aboard</h1>
              <h2>You&#39;re riding NodeJS on Rails!</h2>
            </header>

            <div id="about">
              <h3><a href="/rails/info/properties" onclick="about(); return false">About your application&#39;s environment</a></h3>
              <div id="about-content" style="display: none"></div>
            </div>

            <div id="getting-started">
              <h1>Getting started</h1>
              <h2>Here&#39;s how to get rolling:</h2>

              <ol>
                <li>
                  <h2>Use <code>nrx generate</code> to create your controllers, actions and models</h2>
                  <p>To see all available options, run it without parameters.</p>
                </li>

                <li>
                  <h2>Set up a root route to replace this page</h2>
                  <p>You&#39;re seeing this page because you&#39;re running in development mode and you haven't set a root route yet.</p>
                  <p>Configure a root route in <span class="filename">config/index.js</span>.</p>
                </li>

                <li>
                  <h2>Configure your database</h2>
                  <p>If you're not using SQLite (the default), edit the database in <span class="filename">config/index.js</span> with your connection information.</p>
                </li>
              </ol>
            </div>
          </main>

          <aside id="sidebar">
            <ul id="sidebar-items">
              <li>
                <h3>Browse the documentation</h3>
                <ul class="links">
                  <li><a href="#">Rails Guides (copy from http://guides.rubyonrails.org/)</a></li>
                  <li><a href="#">Rails API (copy from http://api.rubyonrails.org/)</a></li>
                  <li><a href="https://nodejs.org">NodeJS core</a></li>
                </ul>
              </li>
            </ul>
          </aside>

          <footer>&nbsp;</div>
        </div>

        <script>
          function about() {
            var info = document.getElementById('about-content'),
                xhr;

            if (info.innerHTML === '') {
              xhr = new XMLHttpRequest();
              xhr.open("GET", "/rails/info/properties", false);
              xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
              xhr.send("");
              info.innerHTML = xhr.responseText;
            }

            info.style.display = info.style.display === 'none' ? 'block' : 'none';
          }
        </script>
      </body>
    </html>
    `
  },
  versions: {
    ejs: "2.6.1",
    eslint: "5.8.0",
    knex: "0.15.2",
    npm: "0.3.0",
    prettier: "1.14.2",
    uuid: "3.3.2"
  },
  viewActionNames: ["index", "new", "show", "edit"]
};
