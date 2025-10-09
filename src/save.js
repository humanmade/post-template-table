import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

/**
 * Save output for the block.
 *
 * @returns {Element} Wrapper and inner blocks structures.
 */
export default function save() {
	const blockProps = useBlockProps.save();

	const innerBlocksProps = useInnerBlocksProps.save();

	return (
		<div { ...blockProps } { ...innerBlocksProps } />
	);
}
