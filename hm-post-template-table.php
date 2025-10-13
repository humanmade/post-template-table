<?php
/**
 * Plugin Name:       HM Post Template Table
 * Description:       A table-based alternative to the core/post-template block for displaying query results.
 * Version:           1.0.3
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

use WP_Block;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	die;
}

define( 'HM_POST_TEMPLATE_TABLE_VERSION', '1.0.3' );
define( 'HM_POST_TEMPLATE_TABLE_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'HM_POST_TEMPLATE_TABLE_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

/**
 * Register the block.
 */
function register_block() {
	register_block_type( HM_POST_TEMPLATE_TABLE_PLUGIN_DIR . 'build' );
}

add_action( 'init', __NAMESPACE__ . '\\register_block' );

/**
 * Register block pattern for query loop with post template table.
 */
function register_block_pattern() {
	\register_block_pattern(
		'hm/query-loop-table',
		[
			'title'       => __( 'Query Loop Table', 'hm-post-template-table' ),
			'description' => __( 'A query loop displaying posts in a table format with pagination.', 'hm-post-template-table' ),
			'categories'  => [ 'query' ],
			'blockTypes'  => [ 'core/query' ],
			'content'     => '<!-- wp:query {"queryId":1,"query":{"perPage":10,"pages":0,"offset":0,"postType":"post","order":"desc","orderBy":"date","author":"","search":"","exclude":[],"sticky":"","inherit":false}} -->
<div class="wp-block-query"><!-- wp:hm/post-template-table -->
<div class="wp-block-hm-post-template-table">
<!-- wp:post-featured-image {"sizeSlug":"thumbnail","isLink":true,"aspectRatio":"1","width":"40px","height":"40px"} /-->

<!-- wp:post-title {"isLink":true} /-->

<!-- wp:post-date /--></div>
<!-- /wp:hm/post-template-table -->

<!-- wp:query-pagination -->
<!-- wp:query-pagination-previous /-->

<!-- wp:query-pagination-numbers /-->

<!-- wp:query-pagination-next /-->
<!-- /wp:query-pagination --></div>
<!-- /wp:query -->',
		]
	);
}

add_action( 'init', __NAMESPACE__ . '\\register_block_pattern' );

/**
 * Return CSS classes for the table column th tags.
 *
 * @param WP_Block $block The inner block for the column.
 * @return string
 */
function get_column_classes( WP_Block $block ) : string {
	$classes = [ 'wp-block-hm-post-template-table__column' ];
	$attributes = $block->parsed_block['attrs'];

	$classes[] = sprintf(
		'wp-block-hm-post-template-table__column--%s',
		str_replace( '/', '-', $block->parsed_block['blockName'] )
	);

	$classes[] = sprintf(
		'has-text-align-%s',
		$attributes['textAlign'] ?? $attributes['align'] ?? 'left'
	);

	return implode( ' ', $classes );
}

/**
 * Get column width styles.
 *
 * @param array $column_widths All column widths.
 * @param int   $column_index Column index.
 * @return string Style attribute string.
 */
function get_column_width_style( $column_widths, $column_index ) {
	if ( empty( $column_widths[ $column_index ] ) ) {
		return '';
	}

	$width_config = $column_widths[ $column_index ];
	$styles = [];

	// Fixed units that don't need a separate min-width.
	$fixed_units = [ 'px', 'em', 'rem' ];

	if ( ! empty( $width_config['width'] ) ) {
		$is_fixed_unit = isset( $width_config['unit'] ) && in_array( $width_config['unit'], $fixed_units, true );

		if ( $is_fixed_unit ) {
			$styles[] = 'width: ' . esc_attr( $width_config['width'] );
			$styles[] = 'min-width: ' . esc_attr( $width_config['width'] );
		} else {
			$styles[] = 'width: ' . esc_attr( $width_config['width'] );
			if ( ! empty( $width_config['minWidth'] ) ) {
				$styles[] = 'min-width: ' . esc_attr( $width_config['minWidth'] );
			}
		}
	}

	return ! empty( $styles ) ? ' style="' . implode( '; ', $styles ) . '"' : '';
}
