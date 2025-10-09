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

## License

GPL-2.0-or-later
