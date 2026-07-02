<?php
/**
 * Plugin Name:       HM Post Template Table
 * Description:       A table-based alternative to the core/post-template block for displaying query results.
 * Version:           1.0.6
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Author:            Human Made
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       hm-post-template-table
 *
 * @package hm-post-template-table
 */

namespace HM\PostTemplateTable;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	die;
}

const HM_POST_TEMPLATE_TABLE_VERSION = '1.0.5';
const HM_POST_TEMPLATE_TABLE_PLUGIN_DIR = __DIR__;

require_once __DIR__ . '/inc/namespace.php';

bootstrap();
