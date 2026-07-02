import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

/**
 * Save output for the block.
 *
 * @return {Element} Wrapper and inner blocks structures.
 */
export default function save() {
	const blockProps = useBlockProps.save();

	const innerBlocksProps = useInnerBlocksProps.save();

	return <div { ...blockProps } { ...innerBlocksProps } />;
}
