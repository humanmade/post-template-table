import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
	BlockContextProvider,
	RichText,
} from '@wordpress/block-editor';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { getBlockType } from '@wordpress/blocks';
import {
	PanelBody,
	ToggleControl,
	Spinner,
} from '@wordpress/components';
import { createHigherOrderComponent } from '@wordpress/compose';
import { store as coreStore } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import { useCallback, useEffect } from '@wordpress/element';
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';

/**
 * Edit component for the hm-post-template-table block.
 *
 * @param {object}   props               - Component props.
 * @param {object}   props.attributes    - Block attributes.
 * @param {Function} props.setAttributes - Function to update block attributes.
 * @param {string}   props.clientId      - Block client ID.
 * @param {object}   props.context       - Block context.
 * @returns {Element} The edit interface for the block.
 */
export default function Edit( { attributes, setAttributes, clientId, context } ) {
	const { columns, showHeader } = attributes;

	const blockProps = useBlockProps( {
		className: 'wp-block-table',
	} );

	const { innerBlocks, posts, isResolving } = useSelect(
		select => {
			const { getBlocks } = select( blockEditorStore );
			const { getEntityRecords } = select( coreStore );
			const query = context?.query || {};
			const postType = query?.postType || 'post';
			const perPage = query?.perPage || 10;

			// Ensure boolean value.
			query.sticky = Boolean( query.sticky );

			return {
				innerBlocks: getBlocks( clientId ),
				posts: getEntityRecords( 'postType', postType, {
					per_page: perPage,
					...query,
				} ),
				isResolving: ! select( coreStore ).hasFinishedResolution( 'getEntityRecords', [
					'postType',
					postType,
					{
						per_page: perPage,
						...query,
					},
				] ),
			};
		},
		[ clientId, context ]
	);

	/**
	 * Update a column label.
	 *
	 * @param {string} blockClientId - The clientId of the block.
	 * @param {string} newLabel      - The new label.
	 */
	const updateColumnLabel = useCallback( ( blockClientId, newLabel ) => {
		const newColumns = columns.map( col => {
			if ( col.clientId === blockClientId ) {
				col.label = newLabel;
			}
			return col;
		} );
		setAttributes( { columns: newColumns } );
	}, [ columns, setAttributes ] );

	useEffect( () => {
		const newColumns = innerBlocks.map( ( block, index ) => {
			const column =
				columns.find( col => col.clientId === block.clientId ) ||
				columns.find( col => col.index === index );
			return {
				clientId: block.clientId,
				index,
				label: column ? column?.label : getBlockType( block.name ).title,
			};
		} );
		if ( JSON.stringify( columns ) !== JSON.stringify( newColumns ) ) {
			setAttributes( { columns: newColumns } );
		}
	}, [ columns, innerBlocks, setAttributes ] );

	const innerBlocksProps = useInnerBlocksProps(
		{},
		{
			template: [
				[ 'core/post-featured-image' ],
				[ 'core/post-title' ],
				[ 'core/post-date' ],
			],
			orientation: 'horizontal',
		}
	);

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Table Settings', 'hm-post-template-table' ) }>
					<ToggleControl
						checked={ showHeader }
						label={ __( 'Show Header Row', 'hm-post-template-table' ) }
						onChange={ value => setAttributes( { showHeader: value } ) }
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				{ isResolving && (
					<div className="wp-block-hm-post-template-table__loading">
						<Spinner />
					</div>
				) }
				{ ! isResolving && (
					<table className="wp-block-hm-post-template-table__table">
						{ showHeader && (
							<thead>
								<tr>
									{ innerBlocks.map( innerBlock => {
										const align = innerBlock.attributes?.textAlign || innerBlock.attributes?.align || 'left';
										const column = columns.find( col => col.clientId === innerBlock.clientId );
										const columnLabel = column ? column.label : ( getBlockType( innerBlock.name )?.title || '' );
										return (
											<th
												key={ innerBlock.clientId }
												className={ `wp-block-hm-post-template-table__column wp-block-hm-post-template-table__column--${ innerBlock.name.replace( '/', '-' ) } has-text-align-${ align }` }
											>
												<RichText
													placeholder="&hellip;"
													tagName="span"
													value={ columnLabel }
													onChange={ value => updateColumnLabel( innerBlock.clientId, value ) }
												/>
											</th>
										);
									} ) }
								</tr>
							</thead>
						) }
						<tbody>
							{ /* First row with editable InnerBlocks displayed horizontally */ }
							<BlockContextProvider
								value={ {
									postId: posts[0]?.id,
									postType: posts[0]?.type,
								} }
							>
								<tr { ...innerBlocksProps } />
							</BlockContextProvider>
							{ posts && posts.length > 1 && (
								<tr>
									<td colSpan={ innerBlocks.length }>
										{ __( 'The full table will be shown when previewing, the remaining posts to be shown are:', 'hm-post-template-table' ) }
										<ul>
											{ ( posts || [] ).slice( 1 ).map( post => (
												<li>{ post.title.rendered }</li>
											) ) }
										</ul>
									</td>
								</tr>
							) }
							{ innerBlocks.length === 0 && (
								<td className="hm-post-template-table__placeholder" colSpan={ columns.length }>
									{ __( 'Add post blocks to create table columns', 'hm-post-template-table' ) }
								</td>
							) }
						</tbody>
					</table>
				) }
			</div>
		</>
	);
}

/**
 * Filter to wrap inner blocks with td elements when parent is our table block.
 */
const withTableCellWrapper = createHigherOrderComponent( BlockListBlock => {
	return props => {
		const { getBlockRootClientId, getBlock } = useSelect( blockEditorStore );
		const parentClientId = getBlockRootClientId( props.clientId );
		const parentBlock = parentClientId ? getBlock( parentClientId ) : null;

		// Check if immediate parent is our table block.
		if ( parentBlock?.name === 'hm/post-template-table' ) {
			return (
				<td>
					<BlockListBlock { ...props } />
				</td>
			);
		}

		return <BlockListBlock { ...props } />;
	};
}, 'withTableCellWrapper' );

addFilter(
	'editor.BlockListBlock',
	'hm/post-template-table/with-table-cell-wrapper',
	withTableCellWrapper
);
