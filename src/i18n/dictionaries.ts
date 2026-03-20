export type Language = 'en' | 'ko';

export const dictionaries = {
  en: {
    // --- Home Page ---
    home_title_main: "The Free-Time Machine",
    home_title_sub: "Gemini Connect",
    home_description: "Picture yourself with up to 10 hours back per week, thanks to Gemini.",
    home_start_button: "Start",
    home_link_details: "See how Gemini is helping you save up to 10 hours per week",
    home_consent_title: "Before you begin",
    home_consent_desc: "The Gemini Free-Time Machine is an experiment using Nano Banana 2, Google's latest generative model.\n\nTake a photo and we'll create a picture using your selected effect. By submitting your photo, you confirm that you are 18 or older and consent to Google processing your image to generate your picture. To download it, simply scan the QR code provided at the end.",
    home_consent_accept: "Accept and proceed",
    home_consent_decline: "Do not accept",
    home_consent_loading: "Connecting...",

    // --- Kiosk Flow: Camera ---
    camera_title: "Strike a Pose!",
    camera_subtitle: "Look directly into the camera. A clean, well-lit face works best.",
    camera_btn_take: "Take Photo",
    camera_btn_retake: "Retake Photo",
    camera_btn_continue: "Looks Good",
    
    // --- Kiosk Flow: Themes & Styles ---
    theme_title: "What's your vibe?",
    theme_subtitle: "Choose a theme for your AI portrait.",
    style_title: "Choose an Art Style",
    style_subtitle: "How should Gemini render your vision?",
    btn_back: "Back",
    btn_surprise: "Surprise me!",
    btn_generate: "Make these updates",


    // --- Kiosk Flow: Dynamic UI ---
    camera_smile: "Smile!",
    camera_wheelchair: "I'm a wheelchair user",
    camera_retaking: "Retaking in...",
    
    // --- STYLES ---
    style_figurine_title: "1/7 Scale Figurine",
    style_figurine_detail: "Medium: 1/7 scale collectible PVC figurine. Render the subject as a highly detailed plastic statue placed within the requested environment. Frame the shot as macro photography, ensuring the lighting matches the scene but highlights the glossy, painted finish of a physical collectible. Do not use a generic studio background; integrate the figurine directly into the requested setting.",
    style_keychain_title: "3D Keychain",
    style_keychain_detail: "Medium: 3D Keychain character toy. Render the subject as a chunky, stylized plastic toy attached to a metal keyring. Position the keychain within the requested environment using macro photography scale. Ensure the lighting matches the scene while reflecting off the glossy, solid plastic textures of the toy.",
    style_oil_title: "Oil Painting",
    style_oil_detail: "Style: Classic 19th-century oil painting on canvas. Use thick, visible impasto brushstrokes. Adapt the lighting of the requested scene into a dramatic chiaroscuro style, maintaining soft shadows and a painted aesthetic across the entire environment. Ensure subtle canvas texture is visible throughout the image.",
    style_clay_title: "Claymation",
    style_clay_detail: "Medium: Handcrafted stop-motion claymation. Render the subject and the immediate environment using smooth, sculpted clay textures. Ensure the lighting matches the requested scene but highlights the tactile, fingerprint-textured nature of physical clay. Use a charming, stylized stop-motion aesthetic.",
    style_editorial_title: "Magazine Editorial",
    style_editorial_detail: "Style: High-end magazine cover photoshoot. Use professional editorial flash lighting and sharp focus to capture the subject in the requested environment. Apply sophisticated styling and color grading to create a premium, aspirational, hyper-detailed aesthetic.",
    style_cinematic_title: "Cinematic Epic",
    style_cinematic_detail: "Style: Hollywood blockbuster cinematography, shot on 35mm anamorphic lens, dramatic rim lighting, epic scale, photorealistic, shallow depth of field.",
    style_noir_title: "Timeless Noir",
    style_noir_detail: "Style: Classic black and white film noir style, dramatic high-contrast lighting, sharp shadows, elegant, vintage 35mm rangefinder camera aesthetic, sophisticated and powerful.",
    style_visionary_title: "Tech Visionary",
    style_visionary_detail: "Style: Sleek futuristic sci-fi aesthetic. Render the subject and requested environment as a hyper-realistic 3D render. Infuse the scene with subtle glowing neon accents, holographic elements, and a clean, forward-thinking high-tech vibe without losing the core setting.",

    // --- THEMES ---
    theme_recipe_title: "Learn a new recipe",
    theme_recipe_var0_scene: "rustic Italian villa kitchen",
    theme_recipe_var0_activity: "kneading fresh pasta dough",
    theme_recipe_var1_scene: "molecular gastronomy lab",
    theme_recipe_var1_activity: "creating edible liquid nitrogen art",
    theme_recipe_var2_scene: "bustling street food market",
    theme_recipe_var2_activity: "tossing a perfect artisan pizza",

    theme_zen_title: "Find my zen",
    theme_zen_var0_scene: "misty mountaintop temple",
    theme_zen_var0_activity: "performing slow, graceful Tai Chi",
    theme_zen_var1_scene: "floating crystal lotus pod",
    theme_zen_var1_activity: "deep meditation in zero gravity",
    theme_zen_var2_scene: "glowing bioluminescent forest",
    theme_zen_var2_activity: "listening to the whispers of ancient trees",

    theme_active_title: "Get more active",
    theme_active_var0_scene: "neon-lit urban rooftop",
    theme_active_var0_activity: "striking a dynamic athletic pose on a secure rooftop",
    theme_active_var1_scene: "underwater coral gymnasium",
    theme_active_var1_activity: "swimming with mechanical dolphins",
    theme_active_var2_scene: "desert canyon adventure",
    theme_active_var2_activity: "rock climbing up a vertical mesa",

    theme_break_title: "Take a well-earned break",
    theme_break_var0_scene: "luxury cloud resort",
    theme_break_var0_activity: "lounging in a golden hammock",
    theme_break_var1_scene: "secluded x hot spring cave",
    theme_break_var1_activity: "relaxing in steaming mineral waters wearing a plush luxury spa robe",
    theme_break_var2_scene: "vintage jazz lounge on Mars",
    theme_break_var2_activity: "sipping a cosmic mocktail",

    theme_skill_title: "Learn a new skill",
    theme_skill_var0_scene: "master glassblower workshop",
    theme_skill_var0_activity: "shaping a molten glass phoenix",
    theme_skill_var1_scene: "grand symphony hall",
    theme_skill_var1_activity: "conducting an orchestra of musicians",
    theme_skill_var2_scene: "digital neon arcade",
    theme_skill_var2_activity: "winning a pro-gaming championship",

    theme_creative_title: "Get more creative",
    theme_creative_var0_scene: "rooftop garden studio",
    theme_creative_var0_activity: "sculpting a giant floral statue",
    theme_creative_var1_scene: "street art alleyway",
    theme_creative_var1_activity: "spray painting a vibrant mural",
    theme_creative_var2_scene: "grand symphony hall",
    theme_creative_var2_activity: "conducting an orchestra of lights",

    theme_imagination_title: "Let my imagination run loose",
    theme_imagination_var0_scene: "steampunk airship bridge",
    theme_imagination_var0_activity: "navigating through a thundercloud",
    theme_imagination_var1_scene: "giant mushroom kingdom",
    theme_imagination_var1_activity: "talking to a curious dragon",
    theme_imagination_var2_scene: "floating clockwork city",
    theme_imagination_var2_activity: "rewinding the gears of time",

    theme_green_title: "Master the Green",
    theme_green_var0_scene: "lush, sun-drenched championship golf course",
    theme_green_var0_activity: "sinking a perfect tournament-winning putt",
    theme_green_var1_scene: "exclusive private grass tennis court at golden hour",
    theme_green_var1_activity: "executing a flawless jumping backhand smash",
    theme_green_var2_scene: "dramatic cliffside golf hole overlooking a crashing ocean",
    theme_green_var2_activity: "teeing off into a spectacular sunset",

    theme_culinary_title: "Indulge my inner foodie",
    theme_culinary_var0_scene: "exclusive Chef's table in a Michelin-star kitchen",
    theme_culinary_var0_activity: "tasting a masterpiece of molecular gastronomy",
    theme_culinary_var1_scene: "sunlit luxury terrace overlooking the Amalfi coast",
    theme_culinary_var1_activity: "enjoying a perfectly plated truffle risotto",
    theme_culinary_var2_scene: "misty, ancient forest in the Piedmont region",
    theme_culinary_var2_activity: "foraging for rare white truffles with a master guide",

    theme_warrior_title: "Unleash the weekend warrior",
    theme_warrior_var0_scene: "rugged, pine-covered mountain bike trail",
    theme_warrior_var0_activity: "catching air over a massive dirt jump",
    theme_warrior_var1_scene: "remote, untouched backcountry mountain peak",
    theme_warrior_var1_activity: "carving fresh powder tracks on a snowboard",
    theme_warrior_var2_scene: "roaring, crystal-clear white-water canyon river",
    theme_warrior_var2_activity: "expertly navigating a sleek carbon-fiber kayak",

    theme_racing_title: "Chase the Grand Prix thrill",
    theme_racing_var0_scene: "sweeping corner of a sunlit private race circuit",
    theme_racing_var0_activity: "steering a roaring classic red Italian sports car",
    theme_racing_var1_scene: "glamorous European coastal street circuit at dusk",
    theme_racing_var1_activity: "celebrating a first-place podium finish",
    theme_racing_var2_scene: "pristine, high-tech luxury racing garage",
    theme_racing_var2_activity: "analyzing telemetry data next to a prototype endurance hypercar",

    theme_alpine_title: "Conquer the Alpine peaks",
    theme_alpine_var0_scene: "dramatic, snow-capped Swiss summit",
    theme_alpine_var0_activity: "standing victorious with an ice axe in hand",
    theme_alpine_var1_scene: "sheer, vertical granite rock face above the clouds",
    theme_alpine_var1_activity: "scaling a rock face wearing a high-tech climbing harness and safety ropes",
    theme_alpine_var2_scene: "remote, untouched glacier in British Columbia",
    theme_alpine_var2_activity: "carving the first tracks after a thrilling heli-drop",

    // --- Kiosk Flow: Loading ---
    loading_message_0: "Initializing Gemini Nano Banana 2 model...",
    loading_message_1: "Analyzing facial structure and lighting...",
    loading_message_2: "Applying selected theme and style...",
    loading_message_3: "Generating high-resolution details...",
    loading_message_4: "Adding final polish and cinematic effects...",

    // --- Kiosk Flow: Results & Refine ---
    result_title: "Ta-da!",
    result_subtitle: "Scan the code to download your masterpiece.",
    btn_adjust_style: "Adjust style",
    btn_make_video: "Animate Me",
    btn_generating_video: "Generating Video...",
    btn_retry_video: "Retry Video",
    btn_done: "I'm done!",

    // --- Kiosk Flow: Video Loading ---
    video_loading_title: "Veo 3.1 is directing your cinematic shot...",
    video_loading_subtitle: "This usually takes 1-2 minutes.",

    // --- Kiosk Flow: Video Results ---
    video_result_title: "Action!",
    video_result_subtitle: "Scan to download your photo & video.",

    // --- Kiosk Flow: Thanks ---
    thanks_title: "Enjoy your free time!",
    thanks_start_over: "Start over"
  },
  ko: {
    // --- Home Page ---
    home_title_main: "The Free-Time Machine",
    home_title_sub: "Gemini Connect",
    home_description: "Gemini 덕분에 매주 최대 10시간의 여유를 되찾은 모습을 상상해 보세요.",
    home_start_button: "시작하기",
    home_link_details: "Gemini 이 교육자와 리더들에게 어떻게 매주 10시간의 여유를 선사하는지 확인해 보세요.",
    home_consent_title: "시작하기 전에",
    home_consent_desc: "Gemini Free-Time Machine은 Google의 최신 생성형 이미지 모델인 Nano Banana Pro를 활용한 실험적인 기술 체험입니다.\n\n사진을 촬영한 후 원하는 효과를 선택하면 특별한 이미지가 생성됩니다. 사진을 제출함으로써 귀하는 18세 이상이며, 이미지 생성을 위한 구글의 데이터 처리 절차에 동의하는 것으로 간주됩니다. 완성된 이미지를 다운로드하려면, 마지막 단계에서 제공되는 QR 코드를 스캔해 주세요.",
    home_consent_accept: "동의하고 진행",
    home_consent_decline: "동의하지 않음",
    home_consent_loading: "연결중입니다...",

    // --- Kiosk Flow: Camera ---
    camera_title: "준비하세요...",
    camera_subtitle: "[KOREAN] Look directly into the camera. A clean, well-lit face works best.",
    camera_btn_take: "사진 찍기",
    camera_btn_retake: "사진 다시 찍기",
    camera_btn_continue: "좋아 보이네요!",
    
    // --- Kiosk Flow: Themes & Styles ---
    theme_title: "[KOREAN] What's your vibe?",
    theme_subtitle: "[KOREAN] Choose a theme for your AI portrait.",
    style_title: "[KOREAN] Choose an Art Style",
    style_subtitle: "[KOREAN] How should Gemini render your vision?",
    btn_back: "취소",
    btn_surprise: "알아서 만들어줘!",
    btn_generate: "이렇게 바꿔볼게요",


    // --- Kiosk Flow: Dynamic UI ---
    camera_smile: "준비하세요...",
    camera_wheelchair: "저는 휠체어 사용자입니다",
    camera_retaking: "[KOREAN] Retaking in...",
    
    // --- STYLES ---
    style_figurine_title: "[KOREAN] 1/7 Scale Figurine",
    style_figurine_detail: "[KOREAN] Transform the person or group of people in the image into a 1/7 scale commercialized figurine set. The figures should be made of shiny PVC or ABS plastic. The lighting should be bright studio product lighting, highlighting the contours and glossy finish of the figures. Include a subtle, clean studio background. Maintain their facial features but stylize them as high-quality collectible figurines.",
    style_keychain_title: "3D 키링",
    style_keychain_detail: "[KOREAN] Transform the person or group of people in the image into a keychain character version of themselves. They should appear to be made of shiny, solid plastic, attached to a thick metal chain and a keyring. The lighting should be bright and colorful. Ensure the subjects maintain their distinct facial features but in a highly stylized, chunky keychain form. Focus on bold, saturated colors and glossy textures. Only include a single person or group on a single keychain.",
    style_oil_title: "유화",
    style_oil_detail: "[KOREAN] Transform the person or group of people in this photo into a classic 19th-century oil painting on canvas. Use thick, visible impasto brushstrokes and a rich, deep color palette. The lighting should be dramatic chiaroscuro, with soft shadows and a warm glow on the persons face. The background should be a soft, textured abstract landscape or a dark studio setting. Ensure the final result looks like a physical painting with subtle canvas texture visible. Maintain their facial features.",
    style_clay_title: "클레이 애니메이션",
    style_clay_detail: "[KOREAN] Transform the person or group of people in the image into a handcrafted stop-motion claymation miniature, reimagined as an eccentric character with elongated limbs, expressive eyes, and a warm, heartwarming smile in a style merging Tim Burtons and Edward Goreys illustrations. This ultra-detailed cinematic shot features a shallow depth of field, moody practical lighting with deep shadows, and a storybook palette of midnight blue, deep plum, and antique gold. Maintain their facial features.",
    style_editorial_title: "매거진 화보",
    style_editorial_detail: "[KOREAN] Transform the person or group of people in the image into a High-end business magazine cover photoshoot, crisp studio lighting, sharp focus, hyper-detailed, sophisticated styling, GQ or Forbes aesthetic.",
    style_cinematic_title: "영화 속 한 장면",
    style_cinematic_detail: "[KOREAN] Transform the person or group of people in the image into a Hollywood blockbuster cinematography, shot on 35mm anamorphic lens, dramatic rim lighting, epic scale, photorealistic, shallow depth of field.",
    style_noir_title: "클래식 느와르",
    style_noir_detail: "[KOREAN] Transform the person or group of people in the image into a Classic black and white film noir style, dramatic high-contrast lighting, sharp shadows, elegant, vintage Leica camera aesthetic, sophisticated and powerful.",
    style_visionary_title: "미래형 테크",
    style_visionary_detail: "[KOREAN] Transform the person or group of people in the image into a Sleek futuristic aesthetic, subtle glowing neon accents, clean high-tech environment, hyper-realistic 3D render, forward-thinking corporate leadership vibe.",

    // --- THEMES ---
    theme_recipe_title: "새로운 레시피 배우기",
    theme_recipe_var0_scene: "[KOREAN] rustic Italian villa kitchen",
    theme_recipe_var0_activity: "신선한 파스타 반죽 빚기",
    theme_recipe_var1_scene: "[KOREAN] molecular gastronomy lab",
    theme_recipe_var1_activity: "식용 액체 질소 아트 만들기",
    theme_recipe_var2_scene: "[KOREAN] bustling street food market",
    theme_recipe_var2_activity: "완벽한 수제 피자 도우 공중으로 던지기",

    theme_zen_title: "마음의 평화 찾기",
    theme_zen_var0_scene: "[KOREAN] misty mountaintop temple",
    theme_zen_var0_activity: "우아하고 여유롭게 태극권 수련하기",
    theme_zen_var1_scene: "[KOREAN] floating crystal lotus pod",
    theme_zen_var1_activity: "무중력 상태에서 깊은 명상하기",
    theme_zen_var2_scene: "[KOREAN] glowing bioluminescent forest",
    theme_zen_var2_activity: "오래된 고목의 속삭임에 귀 기울이기",

    theme_active_title: "더욱 활동적으로 변하기",
    theme_active_var0_scene: "[KOREAN] neon-lit urban rooftop",
    theme_active_var0_activity: "초고속 파쿠르 마스터하기",
    theme_active_var1_scene: "[KOREAN] underwater coral gymnasium",
    theme_active_var1_activity: "로봇 돌고래와 함께 수영하기",
    theme_active_var2_scene: "[KOREAN] desert canyon adventure",
    theme_active_var2_activity: "아찔한 수직 암벽 등반하기",

    theme_break_title: "꿀맛 같은 휴식 즐기기",
    theme_break_var0_scene: "[KOREAN] luxury cloud resort",
    theme_break_var0_activity: "금빛 해먹에 누워 여유 즐기기",
    theme_break_var1_scene: "[KOREAN] secluded x hot spring cave",
    theme_break_var1_activity: "따뜻한 온천수에 몸 담그기",
    theme_break_var2_scene: "[KOREAN] vintage jazz lounge on Mars",
    theme_break_var2_activity: "신비로운 무알콜 칵테일 음미하기",

    theme_skill_title: "새로운 기술 배우기",
    theme_skill_var0_scene: "[KOREAN] master glassblower workshop",
    theme_skill_var0_activity: "뜨거운 유리로 불사조 모양 빚기",
    theme_skill_var1_scene: "[KOREAN] grand symphony hall",
    theme_skill_var1_activity: "웅장한 오케스트라 지휘하기",
    theme_skill_var2_scene: "[KOREAN] digital neon arcade",
    theme_skill_var2_activity: "e스포츠 챔피언십 우승하기",

    theme_creative_title: "더욱 창의적으로 변하기",
    theme_creative_var0_scene: "[KOREAN] rooftop garden studio",
    theme_creative_var0_activity: "거대한 꽃 조각상 만들기",
    theme_creative_var1_scene: "[KOREAN] street art alleyway",
    theme_creative_var1_activity: "화려한 그래피티 벽화 그리기",
    theme_creative_var2_scene: "[KOREAN] grand symphony hall",
    theme_creative_var2_activity: "환상적인 빛의 오케스트라 지휘하기",

    theme_imagination_title: "상상력 마음껏 발휘하기",
    theme_imagination_var0_scene: "[KOREAN] steampunk airship bridge",
    theme_imagination_var0_activity: "거대한 번개구름 속 뚫고 비행하기",
    theme_imagination_var1_scene: "[KOREAN] giant mushroom kingdom",
    theme_imagination_var1_activity: "호기심 많은 드래곤과 대화하기",
    theme_imagination_var2_scene: "[KOREAN] floating clockwork city",
    theme_imagination_var2_activity: "거대한 시간의 톱니바퀴 되감기",

    theme_green_title: "그린 위의 마스터",
    theme_green_var0_scene: "[KOREAN] lush, sun-drenched championship golf course",
    theme_green_var0_activity: "[KOREAN] 토너먼트 우승을 확정 짓는 완벽한 퍼팅 성공하기",
    theme_green_var1_scene: "[KOREAN] exclusive private grass tennis court at golden hour",
    theme_green_var1_activity: "완벽한 점프 백핸드 스매시 날리기",
    theme_green_var2_scene: "[KOREAN] dramatic cliffside golf hole overlooking a crashing ocean",
    theme_green_var2_activity: "환상적인 노을을 향해 티샷 날리기",

    theme_culinary_title: "숨겨진 미식가 본능",
    theme_culinary_var0_scene: "[KOREAN] exclusive Chef's table in a Michelin-star kitchen",
    theme_culinary_var0_activity: "분자 요리의 걸작 맛보기",
    theme_culinary_var1_scene: "[KOREAN] sunlit luxury terrace overlooking the Amalfi coast",
    theme_culinary_var1_activity: "완벽하게 플레이팅된 트러플 리조또 즐기기",
    theme_culinary_var2_scene: "[KOREAN] misty, ancient forest in the Piedmont region",
    theme_culinary_var2_activity: "전문가와 함께 희귀한 화이트 트러플 채집하기",

    theme_warrior_title: "열정적인 주말 액티비티",
    theme_warrior_var0_scene: "[KOREAN] rugged, pine-covered mountain bike trail",
    theme_warrior_var0_activity: "거대한 흙탕물 위로 멋지게 점프하기",
    theme_warrior_var1_scene: "[KOREAN] remote, untouched backcountry mountain peak",
    theme_warrior_var1_activity: "새하얀 파우더 스노우 위를 스노보드로 가르기",
    theme_warrior_var2_scene: "[KOREAN] roaring, crystal-clear white-water canyon river",
    theme_warrior_var2_activity: "날렵한 카본 카약 능숙하게 조종하기",

    theme_racing_title: "짜릿한 그랑프리 레이싱",
    theme_racing_var0_scene: "[KOREAN] sweeping corner of a sunlit private race circuit",
    theme_racing_var0_activity: "맹렬한 엔진음의 빈티지 페라리 몰기",
    theme_racing_var1_scene: "[KOREAN] glamorous Monaco street circuit at dusk",
    theme_racing_var1_activity: "시상대 정상에서 1위 우승 축하하기",
    theme_racing_var2_scene: "[KOREAN] pristine, high-tech luxury racing garage",
    theme_racing_var2_activity: "르망 하이퍼카 옆에서 주행 데이터 분석하기",

    theme_alpine_title: "알프스 설산 정복",
    theme_alpine_var0_scene: "[KOREAN] dramatic, snow-capped Swiss summit",
    theme_alpine_var0_activity: "얼음도끼를 들고 승리감에 취해 정상에 서기",
    theme_alpine_var1_scene: "[KOREAN] sheer, vertical granite rock face above the clouds",
    theme_alpine_var1_activity: "강렬한 집중력으로 프리 클라이밍 하기",
    theme_alpine_var2_scene: "[KOREAN] remote, untouched glacier in British Columbia",
    theme_alpine_var2_activity: "짜릿한 헬기 강하 후 새하얀 설원의 첫 트랙 가르기",

    // --- Kiosk Flow: Loading ---
    loading_message_0: "Gemini가 당신이 꿈꾸는 일상을 상상하는 중...",
    loading_message_1: "개성 있는 포즈를 분석하는 중...",
    loading_message_2: "고급 예술 스타일을 적용하는 중...",
    loading_message_3: "완벽한 배경 환경을 구성하는 중...",
    loading_message_4: "영화 디테일을 다듬는 중...",

    // --- Kiosk Flow: Results & Refine ---
    result_title: "짜잔!",
    result_subtitle: "QR 코드를 스캔하여 나만의 마스터피스를 다운로드하세요.",
    btn_adjust_style: "스타일 변경하기",
    btn_make_video: "움직이게 하기",
    btn_generating_video: "영상 생성 중…",
    btn_retry_video: "다시 시도",
    btn_done: "다 했어요!",

    // --- Kiosk Flow: Video Loading ---
    video_loading_title: "[KOREAN] Veo 3.1 is directing your cinematic shot...",
    video_loading_subtitle: "[KOREAN] This usually takes 1-2 minutes.",

    // --- Kiosk Flow: Video Results ---
    video_result_title: "액션!",
    video_result_subtitle: "QR 코드를 스캔해 사진과 영상을 저장해 보세요!",

    // --- Kiosk Flow: Thanks ---
    thanks_title: "나만의 여유를 즐겨보세요!",
    thanks_start_over: "새로 촬영하기"
  }
};

export type TranslationKey = keyof typeof dictionaries.en;
