<?php
/**
 * PHP file to use when rendering the block type on the server to show on the front end.
 *
 * The following variables are exposed to the file:
 *     $attributes (array): The block attributes.
 *     $content (string): The block default content.
 *     $block (WP_Block): The block instance.
 *
 * @package hm-post-template-table
 */

// phpcs:ignore HM.Files.NamespaceDirectoryName.NoIncDirectory
namespace HM\PostTemplateTable;

use WP_Block;
use WP_Query;

$show_header = isset( $attributes['showHeader'] ) ? $attributes['showHeader'] : true;
$columns     = isset( $attributes['columns'] ) ? $attributes['columns'] : [];
$class_name  = isset( $attributes['className'] ) ? $attributes['className'] : '';

// Get the query context.
$query_id = $block->context['queryId'] ?? 0;
$query    = $block->context['query'] ?? [];
$page     = empty( $_GET[ 'query-' . $query_id . '-page' ] ) ? 1 : (int) $_GET[ 'query-' . $query_id . '-page' ];

// Build the query arguments.
$query['paged'] = $page;

if ( isset( $query['inherit'] ) && $query['inherit'] ) {
	global $wp_query;
	$query_loop = $wp_query;
} else {
	$query_args = build_query_vars_from_query_block( $block, $page );
	$query_loop = new WP_Query( $query_args );
}

$inner_blocks = $block->inner_blocks;

// Get an instance of the current Post Template block.
$block_instance = $block->parsed_block;

// Set the block name to one that does not correspond to an existing registered block.
// This ensures that for the inner instances of the Post Template block, we do not render any block supports.
$block_instance['blockName'] = 'core/null';
$block_instance['innerHTML'] = '';
array_pop( $block_instance['innerContent'] );
array_shift( $block_instance['innerContent'] );
$block_instance['innerContent'] = array_values( $block_instance['innerContent'] );

?>

<div <?php echo get_block_wrapper_attributes( [ 'class' => 'wp-block-table' ] ); ?>>
	<table class="wp-block-hm-post-template-table__table">
		<?php if ( $show_header && ! empty( $columns ) ) : ?>
			<thead>
				<tr>
					<?php foreach ( $inner_blocks as $i => $inner_block ) : ?>
						<?php
						$column = $columns[ $i ] ?? [];
						$style_attr = get_column_width_style( $column );
						?>
						<th class="<?php echo esc_attr( get_column_classes( $inner_block ) ); ?>" style="<?php echo esc_attr( $style_attr ); ?>">
						<?php
							echo esc_html( $column['label'] ?? $inner_block->block_type->title ?? '' );
						?>
						</th>
					<?php endforeach; ?>
				</tr>
			</thead>
		<?php endif; ?>
		<tbody>
			<?php
			while ( $query_loop->have_posts() ) :
				$query_loop->the_post();
				$post_id = get_the_ID();
				$post_type = get_post_type();

				$filter_block_context = static function ( $context ) use ( $post_id, $post_type ) {
					$context['postType'] = $post_type;
					$context['postId']   = $post_id;
					return $context;
				};

				// Create a counter to track which column we're rendering.
				$column_index = 0;

				$filter_block_container = static function ( $block_content, $block, $block_instance ) use ( $columns, &$column_index ) {
					if ( strpos( $block_content, '<td' ) !== 0 ) {
						$column = $columns[ $column_index ] ?? [];
						$style_attr = get_column_width_style( $column );
						++$column_index;
						$column_label = $column['label'] ?? $block_instance->block_type->title ?? '';

						if ( $style_attr ) {
							return sprintf( '<td style="%s" data-column="%s">%s</td>', esc_attr( $style_attr ), esc_attr( $column_label ), $block_content );
						}
						return sprintf( '<td data-column="%s">%s</td>', esc_attr( $column_label ), $block_content );
					}
					return $block_content;
				};

				// Use an early priority to so that other 'render_block_*' filters have access to the values.
				add_filter( 'render_block_context', $filter_block_context, 1 );
				add_filter( 'render_block', $filter_block_container, 1, 3 );
				?>
				<tr>
					<?php
						// Render the inner blocks of the Post Template block with `dynamic` set to `false` to prevent calling
						// `render_callback` and ensure that no wrapper markup is included.
						echo ( new WP_Block( $block_instance ) )->render( [ 'dynamic' => false ] );
					?>
				</tr>
				<?php
				remove_filter( 'render_block_context', $filter_block_context, 1 );
				remove_filter( 'render_block', $filter_block_container, 1 );
				endwhile;
				wp_reset_postdata();
			?>
			<?php if ( ! $query_loop->have_posts() ) : ?>
				<tr>
					<td colspan="<?php echo count( $inner_blocks ); ?>"><?php esc_html_e( 'No results found', 'hm-post-template-table' ); ?></td>
				</tr>
			<?php endif; ?>
		</tbody>
	</table>
</div>
