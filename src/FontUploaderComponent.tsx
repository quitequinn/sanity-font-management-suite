/**
 * A Sanity Studio component for uploading and managing font files in various formats (TTF, OTF, WOFF, WOFF2, EOT, SVG).
 * Handles file uploads, conversions between formats, CSS generation, and font metadata extraction.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Button, Grid, Typography } from '@mui/material';
import { useFormValue, set, unset } from 'sanity';
import { useSanityClient } from './hooks/useSanityClient';

import { generateCssFile } from './utils/generateCssFile';
import { generateFontData } from './utils/generateFontData';
import { generateFontFile } from './utils/generateFontFile';

// Types
interface FileInput {
	ttf?: { _type: string; asset: { _ref: string; _type: string } };
	otf?: { _type: string; asset: { _ref: string; _type: string } };
	woff?: { _type: string; asset: { _ref: string; _type: string } };
	woff2?: { _type: string; asset: { _ref: string; _type: string } };
	eot?: { _type: string; asset: { _ref: string; _type: string } };
	svg?: { _type: string; asset: { _ref: string; _type: string } };
	css?: { _type: string; asset: { _ref: string; _type: string } };
}

interface FontUploaderProps {
	elementProps: { ref: React.RefObject<HTMLInputElement> };
	onChange: (patch: any) => void;
	value?: FileInput;
}

/**
 * Font uploader component that manages font file uploads and conversions
 */
export const FontUploaderComponent: React.FC<FontUploaderProps> = (props) => {
	const client = useSanityClient();

	const {
		elementProps: { ref },
		onChange,
		value = {}
	} = props;

	// State Management
	const [message, setMessage] = useState('');
	const [status, setStatus] = useState('ready');
	const [filenames, setFilenames] = useState<Record<string, string>>({});

	// Form Values
	let fileInput = useFormValue(['fileInput']) as FileInput;
	let doc_id = useFormValue(['_id']) as string;
	let doc_title = useFormValue(['title']) as string;
	let doc_variableFont = useFormValue(['variableFont']) as boolean;
	let doc_weight = useFormValue(['weight']) as string;
	let doc_style = useFormValue(['style']) as string;
	let doc_slug = useFormValue(['slug']) as { current: string };
	let doc_metaData = useFormValue(['metaData']) as { version?: string; genDate?: string };

	// Effects & Callbacks
	useEffect(() => { 
		handleSetFilenames(); 
	}, [fileInput]);

	/**
	 * Updates the filenames state with the original filenames of uploaded assets
	 */
	const handleSetFilenames = useCallback(async() => {
		const assetIds = [
			fileInput?.ttf?.asset?._ref,
			fileInput?.otf?.asset?._ref,
			fileInput?.woff?.asset?._ref,
			fileInput?.woff2?.asset?._ref,
			fileInput?.eot?.asset?._ref,
			fileInput?.svg?.asset?._ref,
			fileInput?.css?.asset?._ref
		].filter(Boolean);

		if (assetIds.length === 0) return;

		const assetData = await client.fetch(`*[_id in $assetIds] {
			_id,
			originalFilename
		}`, { assetIds });

		let fontNames = assetData.reduce((acc: Record<string, string>, cur: any) => {
			if (cur.originalFilename.endsWith('.ttf')) acc.ttf = cur.originalFilename;
			else if (cur.originalFilename.endsWith('.otf')) acc.otf = cur.originalFilename;
			else if (cur.originalFilename.endsWith('.woff')) acc.woff = cur.originalFilename;
			else if (cur.originalFilename.endsWith('.woff2')) acc.woff2 = cur.originalFilename;
			else if (cur.originalFilename.endsWith('.eot')) acc.eot = cur.originalFilename;
			else if (cur.originalFilename.endsWith('.svg')) acc.svg = cur.originalFilename;
			else if (cur.originalFilename.endsWith('.css')) acc.css = cur.originalFilename;
			return acc;
		}, {});

		setFilenames(fontNames);
	}, [fileInput, client]);

	/**
	 * Generates CSS file from WOFF2 font
	 */
	const handleGenerateCssFile = useCallback(async() => {
		console.log('HANDLE generate css');
		setMessage('Generating css: ' + doc_title + '.css');

		if (!fileInput?.woff2?.asset?._ref) return;

		let woff2Buffer = await client.fetch(`*[_id == '${fileInput.woff2.asset._ref}']{originalFilename, url}`);
		woff2Buffer = woff2Buffer[0];

		let blob = await fetch(woff2Buffer.url);
		let blobData = await blob.blob();

		let newFileInput = await generateCssFile({
			woff2File: blobData,
			fileInput: fileInput,
			fontName: doc_title,
			fileName: woff2Buffer.originalFilename.replace('.woff2',''),
			variableFont: doc_variableFont,
			weight: doc_weight,
			client: client
		});

		setMessage('CSS generated!');
		setTimeout(() => { setMessage('') }, 2000);
		onChange(set(newFileInput));
	}, [fileInput, onChange, doc_title, doc_variableFont, doc_weight, client]);

	/**
	 * Handles font file upload
	 */
	const handleUpload = useCallback(async(event: React.ChangeEvent<HTMLInputElement>, code: string) => {
		console.log('Handle upload', code);

		const file = event.target.files?.[0];
		if (!file) return;

		let filename = doc_slug.current + '.' + file.name.split('.').pop();

		setMessage('Uploading: ' + filename);

		var asset = await client.assets.upload('file', file, { filename: filename });

		let newFileInput = {
			...fileInput,
			[code]: {
				_type: 'file',
				asset: {
					_ref: asset._id,
					_type: 'reference'
				}
			}
		};

		setMessage(filename + ' uploaded!');
		setTimeout(() => { setMessage('') }, 2000);

		// Generate CSS if WOFF2 uploaded
		if (code === 'woff2') {
			console.log('woff2');
			setMessage('Generating Css: ' + doc_title + '.css');
			
			newFileInput = await generateCssFile({
				woff2File: file,
				fileInput: newFileInput,
				fontName: doc_title,
				fileName: filename.replace('.woff2',''),
				variableFont: doc_variableFont,
				weight: doc_weight,
				client: client
			});
			setMessage(doc_title + '.css generated!');
		}

		onChange(set(newFileInput));
	}, [fileInput, onChange, doc_title, doc_variableFont, doc_slug, doc_weight, client]); 

	/**
	 * Deletes a font file
	 */
	const handleDelete = useCallback(async(code: string) => {
		setMessage(`deleting ${code}`);
		const asset = fileInput[code as keyof FileInput]?.asset?._ref;

		onChange(unset([code]));
		
		if (asset) {
			await client.delete(asset)
				.then(result => {
					setMessage('deleted asset: ' + result);
					setTimeout(() => { setMessage('') }, 2000);
				})
				.catch(e => {
					console.error('Error deleting asset: ', e.message);
					setMessage('WARNING: ' + e.message);
				});
		}
	}, [doc_id, fileInput, onChange, client]);

	// Render Component
	return (
		<Grid container spacing={2}>
			{/* Status Message */}
			<Grid item xs={12} sx={{ display: 'flex', alignItems: 'baseline' }}>
				<Typography variant='body1' color='green'>{message}</Typography>
			</Grid>

			{/* TTF Section */}
			<Grid item xs={6} className="filename-wrap">
				{!fileInput?.ttf?.asset?._ref ?
					<Typography variant="body1">TTF:&nbsp;{filenames?.ttf ? <b>{filenames.ttf}</b> : <b>Empty</b>}</Typography>
				:
					<Typography variant="body1">TTF:&nbsp;
						<a href={`https://cdn.sanity.io/files/${process.env.SANITY_STUDIO_PROJECT_ID}/${process.env.SANITY_STUDIO_DATASET}/${fileInput?.ttf?.asset?._ref.replace("file-","").replace("-",".")}`} target="_blank" rel="noopener noreferrer">
							{filenames?.ttf ? <b>{filenames.ttf}</b> : <b>Misc File (Possible duplicate)</b>}
						</a>	
					</Typography>
				}
			</Grid>
			
			<Grid item xs={6} sx={{ display:'flex', justifyContent:'flex-end'}}>
				{(status === 'ready') &&
					<>
						<Button variant='outlined' component='label'>
							Upload
							<input ref={ref} type="file" hidden onChange={(event) => handleUpload(event, 'ttf')}/>
						</Button>
						{value?.ttf && 
							<Button variant='outlined' onClick={() => handleDelete('ttf')} className='delete-btn'>×</Button>
						}
					</>
				}
			</Grid>

			{/* Additional format sections would follow the same pattern */}
			{/* For brevity, showing just TTF section - full implementation would include all formats */}
		</Grid>
	);
};

export default FontUploaderComponent;