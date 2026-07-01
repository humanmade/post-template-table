<?php
/**
 * Main Post Template Table namespace.
 */

namespace HM\PostTemplateTable;

use WP_Block;

/**
 * Connect namespace functions to hooks.
 */
function bootstrap(): void {
	add_action( 'init', __NAMESPACE__ . '\\register_block' );
	add_action( 'init', __NAMESPACE__ . '\\register_block_pattern' );
}

/**
 * Register the block.
 */
function register_block() {
	register_block_type_from_metadata( trailingslashit( HM_POST_TEMPLATE_TABLE_PLUGIN_DIR ) . 'build' );
}

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

/**
 * Return CSS classes for the table column th tags.
 *
 * @param WP_Block $block The inner block for the column.
 * @return string
 */
function get_column_classes( WP_Block $block ): string {
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
 * Render the style attribute for column width styles, or do nothing if no set widths.
 *
 * @param array $column Column configuration array.
 * @return string Style attribute string.
 */
function get_column_width_style( $column ): string {
	if ( empty( $column['width'] ) ) {
		return '';
	}

	$styles = [];

	// Fixed units that don't need a separate min-width.
	$fixed_units = [ 'px', 'em', 'rem' ];

	$is_fixed_unit = isset( $column['unit'] ) && in_array( $column['unit'], $fixed_units, true );

	if ( $is_fixed_unit ) {
		$styles[] = 'width: ' . esc_attr( $column['width'] );
		$styles[] = 'min-width: ' . esc_attr( $column['width'] );
	} else {
		$styles[] = 'width: ' . esc_attr( $column['width'] );
		if ( ! empty( $column['minWidth'] ) ) {
			$styles[] = 'min-width: ' . esc_attr( $column['minWidth'] );
		}
	}

	if ( empty( $styles ) ) {
		return '';
	}

	return implode( '; ', $styles );
}
