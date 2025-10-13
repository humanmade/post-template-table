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
	Button,
	__experimentalUnitControl as UnitControl,
} from '@wordpress/components';
import { createHigherOrderComponent } from '@wordpress/compose';
import { store as coreStore } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import { useCallback, useEffect } from '@wordpress/element';
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';

// Fixed units that don't need a separate min-width.
const FIXED_UNITS = [ 'px', 'em', 'rem' ];

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
	const { columns, showHeader, columnWidths = {} } = attributes;

	const blockProps = useBlockProps( {
		className: 'wp-block-table',
	} );

	const { innerBlocks, posts, isResolving, units } = useSelect(
		select => {
			const { getBlocks, getSettings } = select( blockEditorStore );
			const { getEntityRecords } = select( coreStore );
			const query = context?.query || {};
			const postType = query?.postType || 'post';
			const perPage = query?.perPage || 10;

			// Ensure boolean value.
			query.sticky = Boolean( query.sticky );

			const settings = getSettings();

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
				units: settings?.__experimentalFeatures?.spacing?.units || [ 'px', 'em', 'rem', 'vh', 'vw', '%' ],
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

	// Sync columnWidths when columns are reordered
	useEffect( () => {
		const newColumnWidths = {};
		let hasChanges = false;

		innerBlocks.forEach( ( block, index ) => {
			// Find the old column info
			const column = columns.find( col => col.clientId === block.clientId );
			if ( column && column.index !== undefined ) {
				// If this block had width settings at its old index, move them to the new index
				const oldIndex = column.index;
				if ( columnWidths[ oldIndex ] ) {
					newColumnWidths[ index ] = columnWidths[ oldIndex ];
					if ( oldIndex !== index ) {
						hasChanges = true;
					}
				}
			} else if ( columnWidths[ index ] ) {
				// Keep existing width at this index
				newColumnWidths[ index ] = columnWidths[ index ];
			}
		} );

		if ( hasChanges && JSON.stringify( columnWidths ) !== JSON.stringify( newColumnWidths ) ) {
			setAttributes( { columnWidths: newColumnWidths } );
		}
	}, [ columns, innerBlocks, columnWidths, setAttributes ] );

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
				<PanelBody title={ __( 'Column Widths', 'hm-post-template-table' ) } initialOpen={ false }>
					{ innerBlocks.map( ( innerBlock, index ) => {
						const column = columns.find( col => col.clientId === innerBlock.clientId );
						const columnLabel = column?.label || getBlockType( innerBlock.name )?.title || `Column ${ index + 1 }`;
						const widthConfig = columnWidths[ index ] || {};
						const currentUnit = widthConfig.unit || '%';
						const isFixedUnit = FIXED_UNITS.includes( currentUnit );

						return (
							<div key={ innerBlock.clientId } style={ { marginBottom: '1rem' } }>
								<div style={ { marginBottom: '0.5rem', fontWeight: 500 } }>
									{ columnLabel }
								</div>
								<UnitControl
									label={ __( 'Width', 'hm-post-template-table' ) }
									value={ widthConfig.width || '' }
									units={ units.map( unit => ( { value: unit, label: unit } ) ) }
									onChange={ value => {
										const parsedValue = parseFloat( value );
										const unit = value ? value.replace( parsedValue.toString(), '' ) : '%';
										const newWidthConfig = {
											width: value,
											unit,
										};

										// If switching to a fixed unit, clear min-width
										if ( FIXED_UNITS.includes( unit ) && widthConfig.minWidth ) {
											delete newWidthConfig.minWidth;
										}

										setAttributes( {
											columnWidths: {
												...columnWidths,
												[ index ]: newWidthConfig,
											},
										} );
									} }
								/>
								{ ! isFixedUnit && widthConfig.width && (
									<UnitControl
										label={ __( 'Minimum Width', 'hm-post-template-table' ) }
										value={ widthConfig.minWidth || '' }
										units={ units.map( unit => ( { value: unit, label: unit } ) ) }
										onChange={ value => {
											const parsedValue = parseFloat( value );
											const unit = value ? value.replace( parsedValue.toString(), '' ) : 'px';

											setAttributes( {
												columnWidths: {
													...columnWidths,
													[ index ]: {
														...widthConfig,
														minWidth: value,
														minUnit: unit,
													},
												},
											} );
										} }
									/>
								) }
								{ innerBlocks.length > 1 && (
									<Button
										isDestructive
										size="small"
										variant="secondary"
										onClick={ () => {
											const newColumnWidths = { ...columnWidths };
											delete newColumnWidths[ index ];
											setAttributes( { columnWidths: newColumnWidths } );
										} }
										style={ { marginTop: '0.5rem' } }
									>
										{ __( 'Reset Width', 'hm-post-template-table' ) }
									</Button>
								) }
							</div>
						);
					} ) }
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
									{ innerBlocks.map( ( innerBlock, index ) => {
										const align = innerBlock.attributes?.textAlign || innerBlock.attributes?.align || 'left';
										const column = columns.find( col => col.clientId === innerBlock.clientId );
										const columnLabel = column ? column.label : ( getBlockType( innerBlock.name )?.title || '' );
										const widthConfig = columnWidths[ index ] || {};
										const isFixedUnit = FIXED_UNITS.includes( widthConfig.unit );

										const style = {};
										if ( widthConfig.width ) {
											if ( isFixedUnit ) {
												style.width = widthConfig.width;
												style.minWidth = widthConfig.width;
											} else {
												style.width = widthConfig.width;
												if ( widthConfig.minWidth ) {
													style.minWidth = widthConfig.minWidth;
												}
											}
										}

										return (
											<th
												key={ innerBlock.clientId }
												className={ `wp-block-hm-post-template-table__column wp-block-hm-post-template-table__column--${ innerBlock.name.replace( '/', '-' ) } has-text-align-${ align }` }
												style={ style }
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
			const columnWidths = parentBlock.attributes?.columnWidths || {};
			// Find the index of this block within the parent's inner blocks
			const blockIndex = parentBlock.innerBlocks?.findIndex( block => block.clientId === props.clientId ) ?? -1;
			const widthConfig = blockIndex >= 0 ? ( columnWidths[ blockIndex ] || {} ) : {};
			const isFixedUnit = FIXED_UNITS.includes( widthConfig.unit );

			const style = {};
			if ( widthConfig.width ) {
				if ( isFixedUnit ) {
					style.width = widthConfig.width;
					style.minWidth = widthConfig.width;
				} else {
					style.width = widthConfig.width;
					if ( widthConfig.minWidth ) {
						style.minWidth = widthConfig.minWidth;
					}
				}
			}

			return (
				<td style={ style }>
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
