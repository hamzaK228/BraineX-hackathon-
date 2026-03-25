# 🧭 Notion Integration Guide for MentoraX

## Overview
The Notion integration allows users to search and view content from their Notion workspace directly within the MentoraX platform. This feature is optional and will gracefully degrade if not configured.

## Features Implemented

### ✅ Notion API Integration
- **Status Endpoint**: `/api/notion/status` - Check if Notion is configured and authenticated
- **Search Endpoint**: `/api/notion/search` - Search pages and databases in Notion workspace
- **Pages Endpoint**: `/api/notion/pages/:id` - Fetch page metadata
- **Blocks Endpoint**: `/api/notion/blocks/:id/children` - Fetch page content (blocks)

### ✅ Caching System
- In-memory cache with configurable TTL (Time To Live)
- Reduces API calls and improves performance
- Default cache times:
  - Search results: 60 seconds
  - Page metadata: 5 minutes
  - Block content: 60 seconds

### ✅ UI Components
- **Notion Guides Section**: New section in notion.html for viewing Notion content
- **Search Interface**: Text search with type filters (All, Pages, Databases)
- **Results Grid**: Card-based layout showing search results
- **Content Viewer**: Inline viewer for Notion page content
- **Skeleton Loaders**: Smooth loading states while fetching data
- **Error Handling**: User-friendly error messages for all failure scenarios

### ✅ Content Rendering
Supports the following Notion block types:
- Headings (H1, H2, H3)
- Paragraphs with rich text
- Bulleted and numbered lists
- To-do items with checkboxes
- Quotes and callouts
- Images with captions
- Bookmarks (links)
- Code blocks with syntax highlighting
- Dividers

## Setup Instructions

### 1. Create a Notion Integration

1. Go to [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click **"+ New integration"**
3. Give it a name (e.g., "MentoraX Integration")
4. Select your workspace
5. Set capabilities:
   - ✅ Read content
   - ✅ Read user information (optional)
6. Click **"Submit"**
7. Copy the **Internal Integration Token**

### 2. Configure the Server

1. Create a `.env` file in the project root:
   ```bash
   NOTION_TOKEN=secret_your_integration_token_here
   PORT=3000
   ```

2. Share pages/databases with your integration:
   - Open any Notion page you want accessible
   - Click **"Share"** in the top right
   - Click **"Invite"** and select your integration
   - The integration can now access this page and its children

### 3. Install Dependencies

```bash
npm install
```

The following packages are required:
- `node-fetch@^3.3.2` - For making HTTP requests to Notion API
- `dotenv@^16.4.5` - For loading environment variables

### 4. Start the Server

```bash
npm start
# or
node server.js
```

The server will run on `http://localhost:3000`

## Using the Notion Integration

### Without Configuration
If `NOTION_TOKEN` is not set, the feature will display a friendly message:
> "Notion is not configured on the server. Set NOTION_TOKEN in environment to enable search."

Users can still use all other features of MentoraX.

### With Configuration

1. **Navigate to My Goals**: Click "My Goals" in the navigation menu
2. **Open Notion Guides**: Click "🧭 Notion Guides" in the sidebar
3. **Search Content**:
   - Enter search terms in the input field
   - Select filter (All, Pages, or Databases)
   - Click "Search" or press Enter
4. **View Results**: Click "View" on any result card to see the content
5. **Open in Notion**: Click "Open in Notion ↗" to view in the Notion app

## API Endpoints Reference

### GET /api/notion/status
Check if Notion integration is configured and authenticated.

**Response (Not Configured):**
```json
{
  "configured": false,
  "message": "NOTION_TOKEN not set on server"
}
```

**Response (Configured):**
```json
{
  "configured": true,
  "ok": true,
  "data": { ... }
}
```

### POST /api/notion/search
Search for pages and databases in the Notion workspace.

**Request Body:**
```json
{
  "query": "search term",
  "filter": {
    "value": "page",
    "property": "object"
  },
  "sort": {
    "direction": "descending",
    "timestamp": "last_edited_time"
  }
}
```

**Response:**
```json
{
  "ok": true,
  "status": 200,
  "data": {
    "results": [ ... ]
  }
}
```

### GET /api/notion/pages/:id
Fetch metadata for a specific Notion page.

**Response:**
```json
{
  "ok": true,
  "status": 200,
  "data": { ... }
}
```

### GET /api/notion/blocks/:id/children
Fetch content blocks for a Notion page.

**Response:**
```json
{
  "ok": true,
  "status": 200,
  "data": {
    "results": [ ... ]
  }
}
```

## Error Handling

### CORS Issues
**Resolved**: API calls are proxied through the MentoraX server to avoid CORS restrictions.

### Authentication Errors
- The status endpoint will show if authentication fails
- Check that your integration token is correct
- Verify the integration has access to the pages you're searching

### Rate Limiting
- Notion API has rate limits (3 requests per second)
- The caching system helps minimize API calls
- Consider implementing request throttling for high-traffic scenarios

## Troubleshooting

### "Notion is not configured"
- Ensure `.env` file exists in project root
- Verify `NOTION_TOKEN` is set correctly
- Restart the server after adding the token

### "No results found"
- Make sure you've shared pages with your integration
- Check that search terms match your content
- Try searching without filters first

### Content not displaying
- Verify the page/database is shared with the integration
- Check browser console for JavaScript errors
- Some block types may not be supported yet

## Security Considerations

1. **Token Security**: Never commit `.env` file to version control
2. **Server-Side Proxy**: All API calls go through the server (not client-side)
3. **Read-Only Access**: Integration only has read permissions
4. **User Authentication**: Notion feature respects MentoraX authentication

## Future Enhancements

Potential improvements for future versions:
- [ ] Support for more block types (tables, equations, etc.)
- [ ] Database views and filtering
- [ ] Inline editing capabilities
- [ ] Webhook integration for real-time updates
- [ ] Better pagination for large result sets
- [ ] Request throttling and rate limit handling
- [ ] Redis/persistent caching layer

## Technical Stack

- **Backend**: Node.js + Express
- **Notion API**: v2022-06-28
- **HTTP Client**: node-fetch v3
- **Environment**: dotenv
- **Frontend**: Vanilla JavaScript (no frameworks)
- **Styling**: Custom CSS with responsive design

## Support

For issues or questions:
1. Check the Notion API documentation: [https://developers.notion.com](https://developers.notion.com)
2. Review server logs for error details
3. Test endpoints using the test page: `/tmp_rovodev_test_notion.html`

---

**Status**: ✅ Fully Functional
**Last Updated**: 2024
**Version**: 1.0.0
