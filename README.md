# Sanity Font Management Suite

A comprehensive font file management system for Sanity Studio that handles multi-format uploads, automatic conversions, metadata extraction, and intelligent font organization.

## Features

- **📁 Multi-Format Support**: TTF, OTF, WOFF, WOFF2, EOT, SVG font formats
- **🔄 Automatic Conversion**: Convert between font formats with one click
- **📊 Metadata Extraction**: Extract font metrics, character sets, and technical data
- **🎨 CSS Generation**: Auto-generate CSS files from WOFF2 fonts
- **🏗️ Collection Builder**: Automatically create font collections and pairs
- **🔍 Smart Organization**: Subfamily detection and intelligent grouping
- **⚡ Batch Operations**: Process multiple fonts simultaneously
- **🗑️ Asset Management**: Clean up unused files and manage storage

## Components Included

### FontUploaderComponent
Core font file management with upload, conversion, and metadata extraction.

### GenerateCollectionsPairsComponent
Intelligent font organization that creates:
- Full Family collections
- Upright/Italic collections
- Subfamily collections
- Regular/Italic pairs

### Typography Input Components
- Font script uploaders
- Style counters
- Language field management
- OTF processing tools

## Installation

```bash
npm install sanity-font-management-suite
```

## Quick Start

### Basic Font Field

```javascript
import { FontUploaderComponent } from 'sanity-font-management-suite'

export default {
  name: 'font',
  type: 'document',
  fields: [
    {
      name: 'fileInput',
      title: 'Font Files',
      type: 'object',
      fields: [
        {
          name: 'ttf',
          title: 'TTF File',
          type: 'file'
        },
        {
          name: 'woff2',
          title: 'WOFF2 File', 
          type: 'file'
        }
        // ... other format fields
      ],
      components: {
        input: FontUploaderComponent
      }
    }
  ]
}
```

### Typeface with Collections

```javascript
import { GenerateCollectionsPairsComponent } from 'sanity-font-management-suite'

export default {
  name: 'typeface',
  type: 'document',
  fields: [
    {
      name: 'collectionGenerator',
      title: 'Generate Collections & Pairs',
      type: 'string',
      components: {
        input: GenerateCollectionsPairsComponent
      }
    }
  ]
}
```

## Font Formats Supported

| Format | Upload | Generate | CSS Support |
|--------|--------|----------|-------------|
| TTF    | ✅     | ✅       | ✅          |
| OTF    | ✅     | ✅       | ✅          |
| WOFF   | ✅     | ✅       | ✅          |
| WOFF2  | ✅     | ✅       | ✅          |
| EOT    | ✅     | ✅       | ✅          |
| SVG    | ✅     | ✅       | ✅          |

## Features in Detail

### Font Upload & Conversion
- Drag & drop font file uploads
- Automatic format detection
- One-click conversion between formats
- Batch processing for multiple files
- Progress tracking and error handling

### Metadata Extraction
- Font family and style information
- Character set analysis
- Glyph count and metrics
- Variable font axes detection
- OpenType feature support

### CSS Generation
- Automatic @font-face CSS generation
- Variable font CSS support
- Optimized font loading strategies
- Custom font-display options

### Collection Management
- **Full Family**: All fonts in a typeface
- **Uprights**: Regular style fonts only
- **Italics**: Italic style fonts only
- **Subfamilies**: Grouped by font subfamily
- **Pairs**: Matched regular/italic combinations

### Pricing Integration
- Configurable pricing per font
- Collection pricing calculations
- Pair pricing strategies
- Bulk pricing discounts

## Configuration

### Environment Variables

```bash
# Default pricing (optional)
SANITY_STUDIO_DEFAULT_PAIR_PRICE=75
SANITY_STUDIO_DEFAULT_COLLECTION_PRICE=20

# Sanity project configuration
SANITY_STUDIO_PROJECT_ID=your-project-id
SANITY_STUDIO_DATASET=production
```

### Custom Hooks Setup

```javascript
// hooks/useSanityClient.js
import { useClient } from 'sanity'

export const useSanityClient = () => {
  return useClient({ apiVersion: '2023-01-01' })
}
```

## Schema Requirements

### Font Document Schema

```javascript
export default {
  name: 'font',
  type: 'document',
  fields: [
    {
      name: 'title',
      type: 'string'
    },
    {
      name: 'slug',
      type: 'slug',
      options: { source: 'title' }
    },
    {
      name: 'weight',
      type: 'string'
    },
    {
      name: 'style',
      type: 'string'
    },
    {
      name: 'variableFont',
      type: 'boolean'
    },
    {
      name: 'metaData',
      type: 'object'
    }
  ]
}
```

### Collection Schema

```javascript
export default {
  name: 'collection',
  type: 'document',
  fields: [
    {
      name: 'title',
      type: 'string'
    },
    {
      name: 'fonts',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'font' }] }]
    },
    {
      name: 'price',
      type: 'number'
    }
  ]
}
```

## API Reference

### FontUploaderComponent Props

- `value`: Current file input object
- `onChange`: Callback for file changes
- `elementProps`: Standard Sanity input props

### GenerateCollectionsPairsComponent Props

- `value`: Current generator state
- `onChange`: Callback for state changes
- `elementProps`: Standard Sanity input props

## Utilities

### Font Processing
- `generateFontFile()`: Convert font formats
- `generateCssFile()`: Create CSS from fonts
- `generateFontData()`: Extract metadata

### Collection Management
- `createSanityCollection()`: Generate collections
- `createSanityPair()`: Generate font pairs
- `organizeFontsBySubfamily()`: Smart grouping

## Requirements

- Sanity Studio v3+
- React 18+
- Material-UI v5+
- Node.js 16+

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

Contributions welcome! Please read our contributing guidelines and submit pull requests for improvements.

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Create an issue on GitHub
- Check existing issues for solutions
- Review the documentation

## Changelog

### v1.0.0
- Initial release
- Multi-format font support
- Automatic conversion system
- Metadata extraction
- Collection generation
- CSS generation
- Asset management