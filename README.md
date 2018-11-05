# Welcome to Rails: NodeJS

## What's Rails

Rails is a web-application framework that includes everything needed to
create database-backed web applications according to the
[Model-View-Controller (MVC)](https://en.wikipedia.org/wiki/Model-view-controller)
pattern.

Understanding the MVC pattern is key to understanding Rails. MVC divides your
application into three layers: Model, View, and Controller, each with a specific responsibility.

## Model layer

The model layer is currently unimplemented.

## Controller layer

The _**Controller layer**_ is responsible for handling incoming HTTP requests and
providing a suitable response. Usually this means returning HTML, but Rails:NodeJS controllers
can also generate XML, JSON, PDFs, mobile-specific views, and more. Controllers load and
manipulate models, and render view templates in order to generate the appropriate HTTP response.

In Rails, incoming requests are routed to an appropriate controller dynamically based on the URL.

## View layer

The _**View layer**_ is composed of "templates" that are responsible for providing
appropriate representations of your application's resources. Templates are HTML with
embedded Javascript code (EJS files). Views are typically rendered to generate a controller
response, or to generate the body of an email.

In Rails:NodeJS, View generation is handled by [EJS](http://ejs.co/).

## Frameworks and libraries

No outside frameworks or libraries are used at this time.

## Getting Started

1. Install Rails:NodeJS at the command prompt if you haven't yet:

        $ npm install -g rails-nodejs

2. At the command prompt, create a new Rails application:

        $ nrx new myapp

   where "myapp" is the application name.

3. Change directory to `myapp` and start the web server:

        $ cd myapp
        $ nrx server

   Run with `--help` or `-h` for options.

4. Go to `http://localhost:3000` and you'll see the welcome aboard page

## License

NodeJS on Rails is released under the [MIT License](https://opensource.org/licenses/MIT).
