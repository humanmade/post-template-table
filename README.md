# HM Post Template Table

A WordPress block plugin that provides a table-based alternative to the `core/post-template` block for displaying query results.

## Features

- **Table Layout**: Display query loop posts in a structured table format
- **Sortable Columns**: Reorder columns using up/down arrows in the sidebar
- **Editable Headers**: Customize column header labels
- **Toggle Headers**: Option to show/hide the header row
- **Core Block Support**: Works with standard WordPress post blocks:
  - `core/post-title`
  - `core/post-date`
  - `core/post-excerpt`
  - `core/post-featured-image`
  - `core/post-terms`
  - `core/post-author`
  - `core/post-author-name`
  - `core/post-author-biography`
  - `core/avatar`

## Installation

1. Copy this plugin folder to your WordPress `wp-content/plugins/` directory
2. Navigate to the plugin directory: `cd wp-content/plugins/hm-post-template-table`
3. Install dependencies: `npm install`
4. Build the plugin: `npm run build`
5. Activate the plugin in WordPress admin

## Usage

1. Add a **Query Loop** block to your page/post
2. Inside the Query Loop, add the **Post Template Table** block
3. Add post blocks (e.g., Post Title, Post Date) as children to create columns
4. Customize column headers in the block sidebar
5. Reorder columns using the up/down arrows
6. Toggle the header row visibility if needed

## Development

### Build Commands

- `npm run start` - Start development mode with hot reload
- `npm run build` - Build production-ready assets
- `npm run lint:js` - Lint JavaScript files
- `npm run lint:css` - Lint CSS/SCSS files
- `npm run format` - Format code using WordPress standards

## Block Structure

The block must be used as a child of `core/query` (Query Loop block). It renders a table where:

- Each inner block becomes a column
- Each post in the query becomes a row
- Headers are customizable via block attributes

## Requirements

- WordPress 6.0 or higher
- PHP 7.4 or higher
- Node.js for development

## Local Environment

This project uses [wp-env](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-env/) to run a lightweight, containerized WordPress instance at [localhost:3004](http://localhost:3004) for testing purposes. The default username for the localhost environment is `admin`, with the password `password`.

These commands can be used to interact with the environment:

Command | Purpose
---- | ----
`npm run env:start` | Start the local environment at http://localhost:3004
`npm run env:stop` | Turn off the local environment
`npm run env:cli -- wp ...` | Run WP-CLI commands within the environment
`npm run env:logs` | Open (and tail) the error logs for the application<sup>&ddagger;</sup>
`npm run env:db` | Open the database in the mysql command line
`npm run env:destroy` | Fully destroy the local environment (deletes container database)

<sup>&ddagger;</sup> This command deliberately filters out GET/OPTIONS/HEAD/POST/PUT access log entries

## Release Process

Merges to `main` automatically [build](https://github.com/humanmade/post-template-table/actions/workflows/build-release-branch.yml) to the `release` branch. A project may track the `release` branch using [Composer](https://getcomposer.org/) to pull in the latest built beta version.

Commits on the `release` branch may be tagged for installation via [Packagist](https://packagist.org/packages/humanmade/post-template-table) and marked as releases in GitHub for manual download, using a manually-dispatched ["Tag and Release" GH Actions workflow](https://github.com/humanmade/post-template-table/actions/workflows/tag-and-release.yml).

To tag a new release:

1. Choose the target version number using [semantic versioning](https://semver.org/).
2. Check out a `prepare-v#.#.#` branch and bump the `Version` in the [plugin.php](./plugin.php) PHPDoc header.
3. Open a pull request titled "Prepare release v#.#.#".
4. Review and merge the "Prepare release" pull request.
5. Wait for the `release` branch to [update](https://github.com/humanmade/post-template-table/actions/workflows/build-release-branch.yml) with the build that includes the new version number.
6. On the ["Tag and Release" GH Action page](https://github.com/humanmade/post-template-table/actions/workflows/tag-and-release.yml):
   - Click "Run workflow" in the `workflow_dispatch` banner.
   - Fill out the "Version tag" field with your target version number. This must match the `Version` in `plugin.php`. Use the format `v#.#.#`.
   - Click "Run workflow" to apply the specified tag to the `release` branch.

Once the workflow completes, the new version is [tagged](https://github.com/humanmade/post-template-table/tags) and listed in [releases](https://github.com/humanmade/post-template-table/releases). Edit the release notes as needed to clarify changes.

## License

GPL-2.0-or-later
