# Easy AI Image Generator

Generate AI images directly in Obsidian using **OpenAI DALL-E 3** or **Google Gemini Imagen**.

<p>
  <img src="https://raw.githubusercontent.com/gprecious/obsidian-ai-image-generator/main/demo1.gif" width="45%">
  <img src="https://raw.githubusercontent.com/gprecious/obsidian-ai-image-generator/main/demo2.gif" width="45%">
</p>

## Features

- **Multiple AI Providers**: Choose between OpenAI (DALL-E 3) and Google Gemini (Imagen)
- **Korean Auto-Translation**: Automatically translates Korean prompts to English for better results
- **Customizable Settings**: Configure image size, style, and save location
- **Generation History**: Browse past generations and regenerate with one click
- **Quick Access**: Ribbon icon for instant access to generation history
- **Seamless Integration**: Images are automatically embedded in your current note

## Installation

### From Obsidian Community Plugins

1. Open Obsidian Settings
2. Go to **Community Plugins** and disable **Safe Mode**
3. Click **Browse** and search for "Easy AI Image Generator"
4. Install and enable the plugin

### Manual Installation

1. Download the latest release from [GitHub Releases](https://github.com/gprecious/obsidian-ai-image-generator/releases)
2. Extract to your vault's `.obsidian/plugins/obsidian-easy-ai-image-generator/` folder
3. Reload Obsidian
4. Enable the plugin in Settings → Community Plugins

## Setup

### Getting API Keys

#### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy and paste it into the plugin settings

#### Google Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com)
2. Click "Get API Key" in the sidebar
3. Create a new API key
4. Copy and paste it into the plugin settings

### Configuration

1. Open Obsidian Settings → Easy AI Image Generator
2. Enter your API key(s)
3. Select your preferred default provider
4. Configure default image size and style
5. Set your preferred save location (default: `Attachments/`)

## Usage

### Generate an Image

1. Open a note in edit mode
2. Use the command palette (`Ctrl/Cmd + P`) and search for "Generate AI Image"
3. Enter your prompt (Korean supported!)
4. Select size and style options
5. Click "Generate Image"
6. The image will be automatically inserted at your cursor position

### View Generation History

- Click the **image icon** in the left ribbon
- Or use command palette: "Open Image History"

From the history modal, you can:
- **Insert**: Add a previous image to your current note
- **Regenerate**: Create a new image with the same prompt
- **Delete**: Remove an item from history

## Image Options

### Sizes
| Size | Dimensions |
|------|------------|
| Small | 1024×1024 |
| Medium | 1024×1024 |
| Large | 1792×1024 (wide) |

### Styles

#### OpenAI DALL-E 3
- **Vivid**: Dramatic, hyper-real style
- **Natural**: More natural, realistic style

#### Google Gemini
- **Photorealistic**: High detail, photography style
- **Artistic**: Creative, expressive interpretation
- **Anime**: Japanese animation aesthetic
- **Sketch**: Pencil drawing style

## File Naming

Generated images are saved with timestamp-based names:
```
ai_image_YYYYMMDD_HHMMSS.png
```

Example: `ai_image_20250109_143052.png`

## Pricing

This plugin uses external AI services that may incur costs:

- **OpenAI DALL-E 3**: ~$0.04-0.08 per image
- **Google Gemini Imagen**: ~$0.03 per image

Please check the respective pricing pages for current rates.

## Support

If you find this plugin helpful, consider supporting its development:

<a href="https://www.buymeacoffee.com/gprecious" target="_blank">
  <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="50">
</a>

## Links

- [GitHub Repository](https://github.com/gprecious/obsidian-ai-image-generator)
- [Report an Issue](https://github.com/gprecious/obsidian-ai-image-generator/issues)
- [Changelog](https://github.com/gprecious/obsidian-ai-image-generator/releases)

## License

MIT License - see [LICENSE](LICENSE) for details.
