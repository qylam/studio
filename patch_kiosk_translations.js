const fs = require('fs');
const file = 'src/components/kiosk/KioskFlow.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add useLanguage import and hook
if (!content.includes('useLanguage')) {
  content = content.replace(
    "import { useRouter } from 'next/navigation';",
    "import { useRouter } from 'next/navigation';\nimport { useLanguage } from '@/i18n/LanguageProvider';\nimport { TranslationKey } from '@/i18n/dictionaries';"
  );
  content = content.replace(
    "const router = useRouter();",
    "const router = useRouter();\n  const { t } = useLanguage();"
  );
}

// 2. Translate THEMES dynamically in render
const translatedThemesLogic = `
  const translatedThemes = THEMES.map(theme => ({
    ...theme,
    title: t(\`theme_\${theme.id.split('-')[1]}_title\` as TranslationKey),
    variations: theme.variations.map((v, idx) => ({
      scene: t(\`theme_\${theme.id.split('-')[1]}_var\${idx}_scene\` as TranslationKey),
      activity: t(\`theme_\${theme.id.split('-')[1]}_var\${idx}_activity\` as TranslationKey)
    }))
  }));
`;

content = content.replace(
  "const toLowerFirst = (s: string | undefined | null) => {",
  translatedThemesLogic + "\n  const toLowerFirst = (s: string | undefined | null) => {"
);

// 3. Replace THEMES array usage with translatedThemes
content = content.replace(/THEMES/g, "translatedThemes");
// Except for the original const THEMES definition and state typing
content = content.replace(/const translatedThemes = \[/g, "const THEMES = [");
content = content.replace(/typeof translatedThemes\[0\]/g, "typeof THEMES[0]");
content = content.replace(/const translatedThemes = translatedThemes\.map/g, "const translatedThemes = THEMES.map");

// 4. Translate STYLES dynamically in render
const translatedStylesLogic = `
  const translatedStyles = STYLES.map(style => ({
    ...style,
    title: t(\`style_\${style.id.split('-')[1]}_title\` as TranslationKey),
    detail: t(\`style_\${style.id.split('-')[1]}_detail\` as TranslationKey)
  }));
`;

content = content.replace(
  "const translatedThemes = THEMES.map(theme => ({",
  translatedStylesLogic + "\n  const translatedThemes = THEMES.map(theme => ({"
);

// 5. Replace STYLES array usage with translatedStyles
content = content.replace(/STYLES/g, "translatedStyles");
content = content.replace(/const translatedStyles = \[/g, "const STYLES = [");
content = content.replace(/typeof translatedStyles\[0\]/g, "typeof STYLES[0]");
content = content.replace(/const translatedStyles = translatedStyles\.map/g, "const translatedStyles = STYLES.map");

// 6. Translate Processing Messages dynamically
const translatedProcessingMessagesLogic = `
  const translatedProcessingMessages = [
    t('loading_message_0'),
    t('loading_message_1'),
    t('loading_message_2'),
    t('loading_message_3'),
    t('loading_message_4'),
  ];
`;

content = content.replace(
  "const translatedStyles = STYLES.map(style => ({",
  translatedProcessingMessagesLogic + "\n  const translatedStyles = STYLES.map(style => ({"
);

content = content.replace(/PROCESSING_MESSAGES/g, "translatedProcessingMessages");
content = content.replace(/const translatedProcessingMessages = \[/, "const PROCESSING_MESSAGES = [");

// 7. Replace basic UI Strings
content = content.replace(/>Strike a Pose!</g, ">{t('camera_title')}<");
content = content.replace(/>Look directly into the camera\. A clean, well-lit face works best\.</g, ">{t('camera_subtitle')}<");
content = content.replace(/>Take Photo</g, ">{t('camera_btn_take')}<");
content = content.replace(/>Retake Photo</g, ">{t('camera_btn_retake')}<");
content = content.replace(/>Looks Good</g, ">{t('camera_btn_continue')}<");
content = content.replace(/>What's your vibe\?</g, ">{t('theme_title')}<");
content = content.replace(/>Choose a theme for your AI portrait\.</g, ">{t('theme_subtitle')}<");
content = content.replace(/>Choose an Art Style</g, ">{t('style_title')}<");
content = content.replace(/>How should Gemini render your vision\?</g, ">{t('style_subtitle')}<");
content = content.replace(/>Back</g, ">{t('btn_back')}<");
content = content.replace(/>Surprise me!</g, ">{t('btn_surprise')}<");
content = content.replace(/>Make these updates</g, ">{t('btn_generate')}<");
content = content.replace(/>Ta-da!</g, ">{t('result_title')}<");
content = content.replace(/>Scan the code to download your masterpiece\.</g, ">{t('result_subtitle')}<");
content = content.replace(/>Adjust style</g, ">{t('btn_adjust_style')}<");
content = content.replace(/>Make it a Video</g, ">{t('btn_make_video')}<");
content = content.replace(/>Generating Video\.\.\.</g, ">{t('btn_generating_video')}<");
content = content.replace(/>Retry Video</g, ">{t('btn_retry_video')}<");
content = content.replace(/>I'm done!</g, ">{t('btn_done')}<");
content = content.replace(/>Veo 3\.1 is directing your cinematic shot\.\.\.</g, ">{t('video_loading_title')}<");
content = content.replace(/>This usually takes 1-2 minutes\.</g, ">{t('video_loading_subtitle')}<");
content = content.replace(/>Action!</g, ">{t('video_result_title')}<");
content = content.replace(/>Scan to download your photo & video\.</g, ">{t('video_result_subtitle')}<");
content = content.replace(/>Enjoy your free time!</g, ">{t('thanks_title')}<");
content = content.replace(/>Start over</g, ">{t('thanks_start_over')}<");
content = content.replace(/>Smile!</g, ">{t('camera_smile')}<");
content = content.replace(/>I'm a wheelchair user</g, ">{t('camera_wheelchair')}<");
content = content.replace(/>Retaking in\.\.\.</g, ">{t('camera_retaking')}<");

fs.writeFileSync(file, content);
console.log('KioskFlow Patched');
