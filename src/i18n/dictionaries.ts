export type Language = 'en' | 'ko' | 'jp' | 'tc';

export const dictionaries = {
  en: {
    // --- Home Page ---
    home_title_main: "The Free-Time Machine",
    home_description: "Picture yourself with up to 10 hours back per week, thanks to Gemini.",
    home_start_button: "Start",
    home_link_details: "See how Gemini is helping you save up to 10 hours per week",
    home_consent_title: "Before you begin",
    home_consent_desc: "The Gemini Free-Time Machine is an experiment using Nano Banana 2, Google's latest generative model.\n\nTake a photo and we'll create a picture using your selected effect. By submitting your photo, you confirm that you are 18 or older and consent to Google processing your image to generate your picture. To download it, simply scan the QR code provided at the end.",
    home_consent_accept: "Accept and proceed",
    home_consent_decline: "Do not accept",
    home_consent_loading: "Connecting...",

    // --- Study Page ---
    study_header: "Empowering Educators: How Gemini is Helping Transform the Classroom",
    study_body_1: "A recent six-month pilot program involving 100 teachers in Northern Ireland has revealed that integrating Gemini into the classroom doesn't just modernise education—it gives teachers their most valuable resource back: time",
    study_head_2: "10 Hours Saved Per Week", 
    study_body_2: "On average, participating teachers saved 10 hours per week by using Gemini to handle time-consuming administrative tasks.",
    study_head_3: "More Time for Teaching",
    study_body_3: "Teachers reinvested this saved time directly into student engagement and their own professional development.",
    study_head_4: "600+ Unique Use Cases",
    study_body_4: "From drafting risk assessments to brainstorming creative content, educators found hundreds of ways to streamline their workload.",
    btn_continue: "Continue",
    

    // --- Kiosk Flow: Camera ---
    camera_title: "Strike a Pose!",
    camera_btn_take: "Take your Photo",
    camera_btn_retake: "Retake Photo",
    camera_rdy_title: "Get Ready...",
    camera_continue_subtitle: "Looking good?",
    camera_btn_continue: "Looks Great!",
    
    // --- Kiosk Flow: Themes & Styles ---
    theme_title: "What would you do with your free time?",
    style_title: "Select your style",
    btn_back: "Back",
    btn_surprise: "Surprise me!",
    btn_generate: "Make these updates",


    // --- Kiosk Flow: Dynamic UI ---
    camera_smile: "Hold still...",
    camera_wheelchair: "I'm a wheelchair user",
    
    // --- STYLES : For UI ---
    style_figurine_title: "Figurine",
    style_keychain_title: "3D Keychain",
    style_oil_title: "Oil Painting",
    style_clay_title: "Claymation",
    style_cinematic_title: "Cinematic Epic",
    style_editorial_title: "Magazine Editorial",
    style_noir_title: "Timeless Noir",
    style_visionary_title: "Tech Visionary",

    // --- STYLES : For AI, sent as part of the prompt ---
    style_figurine_detail: "Medium: 1/7 scale collectible PVC figurine. Render the subject as a highly detailed plastic statue placed within the requested environment. Frame the shot as macro photography, ensuring the lighting matches the scene but highlights the glossy, painted finish of a physical collectible. Do not use a generic studio background; integrate the figurine directly into the requested setting.",
    style_keychain_detail: "Medium: 3D Keychain character toy. Render the subject as a chunky, stylized plastic toy attached to a metal keyring. Position the keychain within the requested environment using macro photography scale. Ensure the lighting matches the scene while reflecting off the glossy, solid plastic textures of the toy.",
    style_oil_detail: "Style: Classic 19th-century oil painting on canvas. Use thick, visible impasto brushstrokes. Adapt the lighting of the requested scene into a dramatic chiaroscuro style, maintaining soft shadows and a painted aesthetic across the entire environment. Ensure subtle canvas texture is visible throughout the image.",
    style_clay_detail: "Medium: Handcrafted stop-motion claymation. Render the subject and the immediate environment using smooth, sculpted clay textures. Ensure the lighting matches the requested scene but highlights the tactile, fingerprint-textured nature of physical clay. Use a charming, stylized stop-motion aesthetic.",
    style_cinematic_detail: "Style: Hollywood blockbuster cinematography, shot on 35mm anamorphic lens, dramatic rim lighting, epic scale, photorealistic, shallow depth of field.",
    style_editorial_detail: "Style: High-end magazine cover photoshoot. Use professional editorial flash lighting and sharp focus to capture the subject in the requested environment. Apply sophisticated styling and color grading to create a premium, aspirational, hyper-detailed aesthetic.",
    style_noir_detail: "Style: Classic black and white film noir style, dramatic high-contrast lighting, sharp shadows, elegant, vintage 35mm rangefinder camera aesthetic, sophisticated and powerful.",
    style_visionary_detail: "Style: Sleek futuristic sci-fi aesthetic. Render the subject and requested environment as a hyper-realistic 3D render. Infuse the scene with subtle glowing neon accents, holographic elements, and a clean, forward-thinking high-tech vibe without losing the core setting.",

    // --- THEMES ---
    theme_recipe_title: "Learn a new recipe",
    theme_recipe_var0_activity: "kneading fresh pasta dough",
    theme_recipe_var1_activity: "creating edible liquid nitrogen art",
    theme_recipe_var2_activity: "tossing a perfect artisan pizza",
    // --- For prompt use ---
    theme_recipe_var0_scene: "rustic Italian villa kitchen",
    theme_recipe_var1_scene: "molecular gastronomy lab",
    theme_recipe_var2_scene: "bustling street food market",

    theme_zen_title: "Find my zen",
    theme_zen_var0_activity: "performing slow, graceful Tai Chi",
    theme_zen_var1_activity: "deep meditation in zero gravity",
    theme_zen_var2_activity: "listening to the whispers of ancient trees",
    // --- For prompt use ---
    theme_zen_var0_scene: "misty mountaintop temple",
    theme_zen_var1_scene: "floating crystal lotus pod",
    theme_zen_var2_scene: "glowing bioluminescent forest",

    theme_active_title: "Get more active",
    theme_active_var0_activity: "striking a dynamic athletic pose on a secure rooftop",
    theme_active_var1_activity: "swimming with mechanical dolphins",
    theme_active_var2_activity: "rock climbing up a vertical mesa",
    // --- For prompt use ---
    theme_active_var0_scene: "neon-lit urban rooftop",
    theme_active_var1_scene: "underwater coral gymnasium",
    theme_active_var2_scene: "desert canyon adventure",

    theme_break_title: "Take a well-earned break",
    theme_break_var0_activity: "lounging in a golden hammock",
    theme_break_var1_activity: "relaxing in steaming mineral waters wearing a plush luxury spa robe",
    theme_break_var2_activity: "sipping a cosmic mocktail",
    // --- For prompt use ---
    theme_break_var0_scene: "luxury cloud resort",
    theme_break_var1_scene: "secluded x hot spring cave",
    theme_break_var2_scene: "vintage jazz lounge on Mars",

    theme_skill_title: "Learn a new skill",
    theme_skill_var0_activity: "shaping a molten glass phoenix",
    theme_skill_var1_activity: "conducting an orchestra of musicians",
    theme_skill_var2_activity: "winning a pro-gaming championship",
    // --- For prompt use ---
    theme_skill_var0_scene: "master glassblower workshop",
    theme_skill_var1_scene: "grand symphony hall",
    theme_skill_var2_scene: "digital neon arcade",

    theme_creative_title: "Get more creative",
    theme_creative_var0_activity: "sculpting a giant floral statue",
    theme_creative_var1_activity: "spray painting a vibrant mural",
    theme_creative_var2_activity: "conducting an orchestra of lights",
    // --- For prompt use ---
    theme_creative_var0_scene: "rooftop garden studio",
    theme_creative_var1_scene: "street art alleyway",
    theme_creative_var2_scene: "grand symphony hall",

    theme_imagination_title: "Let my imagination run loose",
    theme_imagination_var0_activity: "navigating through a thundercloud",
    theme_imagination_var1_activity: "talking to a curious dragon",
    theme_imagination_var2_activity: "rewinding the gears of time",
    // --- For prompt use ---
    theme_imagination_var0_scene: "steampunk airship bridge",
    theme_imagination_var1_scene: "giant mushroom kingdom",
    theme_imagination_var2_scene: "floating clockwork city",

    theme_green_title: "Master the Green",
    theme_green_var0_activity: "sinking a perfect tournament-winning putt",
    theme_green_var1_activity: "executing a flawless jumping backhand smash",
    theme_green_var2_activity: "teeing off into a spectacular sunset",
    // --- For prompt use ---
    theme_green_var0_scene: "lush, sun-drenched championship golf course",
    theme_green_var1_scene: "exclusive private grass tennis court at golden hour",
    theme_green_var2_scene: "dramatic cliffside golf hole overlooking a crashing ocean",

    theme_culinary_title: "Indulge my inner foodie",
    theme_culinary_var0_activity: "tasting a masterpiece of molecular gastronomy",
    theme_culinary_var1_activity: "enjoying a perfectly plated truffle risotto",
    theme_culinary_var2_activity: "foraging for rare white truffles with a master guide",
    // --- For prompt use ---
    theme_culinary_var0_scene: "exclusive Chef's table in a Michelin-star kitchen",
    theme_culinary_var1_scene: "sunlit luxury terrace overlooking the Amalfi coast",
    theme_culinary_var2_scene: "misty, ancient forest in the Piedmont region",

    theme_warrior_title: "Unleash the weekend warrior",
    theme_warrior_var0_activity: "catching air over a massive dirt jump",
    theme_warrior_var1_activity: "carving fresh powder tracks on a snowboard",
    theme_warrior_var2_activity: "expertly navigating a sleek carbon-fiber kayak",
    // --- For prompt use ---
    theme_warrior_var0_scene: "rugged, pine-covered mountain bike trail",
    theme_warrior_var1_scene: "remote, untouched backcountry mountain peak",
    theme_warrior_var2_scene: "roaring, crystal-clear white-water canyon river",

    theme_racing_title: "Chase the Grand Prix thrill",
    theme_racing_var0_activity: "steering a roaring classic red Italian sports car",
    theme_racing_var1_activity: "celebrating a first-place podium finish",
    theme_racing_var2_activity: "analyzing telemetry data next to a prototype endurance hypercar",
    // --- For prompt use ---
    theme_racing_var0_scene: "sweeping corner of a sunlit private race circuit",
    theme_racing_var1_scene: "glamorous European coastal street circuit at dusk",
    theme_racing_var2_scene: "pristine, high-tech luxury racing garage",

    theme_alpine_title: "Conquer the Alpine peaks",
    theme_alpine_var0_activity: "standing victorious with an ice axe in hand",
    theme_alpine_var1_activity: "scaling a rock face wearing a high-tech climbing harness and safety ropes",
    theme_alpine_var2_activity: "carving the first tracks after a thrilling heli-drop",
    // --- For prompt use ---
    theme_alpine_var0_scene: "dramatic, snow-capped Swiss summit",
    theme_alpine_var1_scene: "sheer, vertical granite rock face above the clouds",
    theme_alpine_var2_scene: "remote, untouched glacier in British Columbia",

    // --- Kiosk Flow: Caption ---
    caption_default: "Enjoying my free-time, thanks to Gemini",
    caption_zen: "Finding my zen, thanks to Gemini",
    caption_break: "Taking a well-earned break, thanks to Gemini",
    caption_creative: "Getting more creative, thanks to Gemini",
    caption_recipe: "Learning a new recipe, thanks to Gemini",
    caption_active: "Getting more active, thanks to Gemini",
    caption_skill: "Learning a new skill, thanks to Gemini",
    caption_imagination: "Letting my imagination run loose, thanks to Gemini",
    caption_green: "Mastering the green, thanks to Gemini",
    caption_culinary: "Indulging in my inner foodie, thanks to Gemini",
    caption_warrior: "Unleashing the weekend warrior, thanks to Gemini",
    caption_racing: "Chasing the Grand Prix thrill, thanks to Gemini",
    caption_alpine: "Conquering the Alpine peaks, thanks to Gemini",

    // --- Kiosk Flow: Loading ---
    loading_message_0: "Initializing Gemini Nano Banana 2 model...",
    loading_message_1: "Analyzing facial structure and lighting...",
    loading_message_2: "Applying selected theme and style...",
    loading_message_3: "Generating high-resolution details...",
    loading_message_4: "Adding final polish and cinematic effects...",
    loading_subtitle: "Powered by Gemini",

    // --- Kiosk Flow: Results & Refine ---
    result_title: "Ta-da!",
    result_subtitle: "Scan the code to download your masterpiece.",
    btn_adjust_style: "Adjust style",
    btn_done: "I'm done!",

    // --- Kiosk Sub-Flow: Refine ---
    refine_description: "Now for the fun part. Refine your prompt to create your masterpiece.",
    refine_label_imagine: "Imagine me",
    refine_label_style: "in the style of",

    // --- Kiosk Sub-Flow: Refine Titles ---
    refine_greet_recipe: "Cooking up\na storm!",
    refine_greet_zen: "Finding your\ninner peace!",
    refine_greet_active: "Bursting with\npure energy!",
    refine_greet_break: "Kicking back\nand relaxing!",
    refine_greet_skill: "Leveling up\nlike a pro!",
    refine_greet_creative: "Sparking some\npure genius!",
    refine_greet_imagination: "Dreaming up\nsomething wild!",
    refine_greet_green: "Looking sharp,\npro player!",
    refine_greet_culinary: "What's cookin',\ngood lookin'!",
    refine_greet_warrior: "Ready for\nthe wild?",
    refine_greet_racing: "Leading the\npack today!",
    refine_greet_alpine: "Reaching new\nheights!",
    refine_greet_default: "Looking good,\ngood lookin'!",

    // --- Kiosk Flow: Thanks ---
    thanks_title: "Enjoy your free time!",
    thanks_start_over: "Start over",

    // --- Download Page ---
    loading_download_caption: "Retrieving your vision...",
    btn_download: "Download Polaroid",
    download_caption: "This vision was created using Gemini, reimagining your free time based on your unique pose."
  },
  ko: {
    // --- Home Page ---
    home_title_main: "The Free-Time Machine",
    home_description: "Gemini 덕분에 매주 최대 10시간의 여유를 되찾은 모습을 상상해 보세요.",
    home_start_button: "시작하기",
    home_link_details: "Gemini 이 교육자와 리더들에게 어떻게 매주 10시간의 여유를 선사하는지 확인해 보세요.",
    home_consent_title: "시작하기 전에",
    home_consent_desc: "Gemini Free-Time Machine은 Google의 최신 생성형 이미지 모델인 Nano Banana Pro를 활용한 실험적인 기술 체험입니다.\n\n사진을 촬영한 후 원하는 효과를 선택하면 특별한 이미지가 생성됩니다. 사진을 제출함으로써 귀하는 18세 이상이며, 이미지 생성을 위한 구글의 데이터 처리 절차에 동의하는 것으로 간주됩니다. 완성된 이미지를 다운로드하려면, 마지막 단계에서 제공되는 QR 코드를 스캔해 주세요.",
    home_consent_accept: "동의하고 진행",
    home_consent_decline: "동의하지 않음",
    home_consent_loading: "연결중입니다...",

    // --- Study Page ---
    study_header: "교육자 역량 강화: Gemini가 교실의 변화를 돕는 방법",
    study_body_1: "최근 북아일랜드에서 100명의 교사를 대상으로 6개월간 진행된 파일럿 프로그램 결과, Gemini의 도입은 단순한 교육 현대화를 넘어 교육자들에게 가장 소중한 자원인 '시간'을 되돌려주었습니다.",
    study_head_2: "매주 10시간 절약", 
    study_body_2: "참여 교사들은 시간이 많이 소요되는 행정 업무에 Gemini를 활용하여 주당 평균 10시간을 절약했습니다.",
    study_head_3: "가르치는 시간 증가",
    study_body_3: "절약된 시간은 학생들과의 긴밀한 소통과 교육자의 전문성 개발에 재투자되었습니다.",
    study_head_4: "600개 이상의 혁신적 활용 사례",
    study_body_4: "리스크 평가 초안 작성부터 창의적인 강의 콘텐츠 구상까지, 업무 전반에 걸쳐 수백 가지의 효율적인 활용 방법을 찾아냈습니다.",
    btn_continue: "계속하기",

    // --- Kiosk Flow: Camera ---
    camera_title: "준비하세요...",
    camera_btn_take: "사진 찍기",
    camera_btn_retake: "사진 다시 찍기",
    camera_rdy_title: "준비...",
    camera_continue_subtitle: "좋아 보이나요?",
    camera_btn_continue: "좋아 보이네요!",
    
    // --- Kiosk Flow: Themes & Styles ---
    theme_title: "여유 시간에 무엇을 하시겠습니까?",
    style_title: "당신의 스타일을 선택하세요",
    btn_back: "돌아가기",
    btn_surprise: "알아서 만들어줘!",
    btn_generate: "이렇게 바꿔볼게요",


    // --- Kiosk Flow: Dynamic UI ---
    camera_smile: "움직이지 마세요...",
    camera_wheelchair: "저는 휠체어 사용자입니다",
    
    // --- STYLES ---
    style_figurine_title: "피규어",
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
    theme_recipe_title_short: "새로운 레시피 배우기",
    theme_recipe_var0_activity: "신선한 파스타 반죽 빚기",
    theme_recipe_var1_activity: "식용 액체 질소 아트 만들기",
    theme_recipe_var2_activity: "완벽한 수제 피자 도우 공중으로 던지기",

    theme_zen_title: "마음의 평화 찾기",
    theme_zen_title_short: "내면의 평화 찾기",
    theme_zen_var0_activity: "우아하고 여유롭게 태극권 수련하기",
    theme_zen_var1_activity: "무중력 상태에서 깊은 명상하기",
    theme_zen_var2_activity: "오래된 고목의 속삭임에 귀 기울이기",

    theme_active_title: "더욱 활동적으로 변하기",
    theme_active_title_short: "활기찬 액티비티 즐기기",
    theme_active_var0_activity: "초고속 파쿠르 마스터하기",
    theme_active_var1_activity: "로봇 돌고래와 함께 수영하기",
    theme_active_var2_activity: "아찔한 수직 암벽 등반하기",

    theme_break_title: "꿀맛 같은 휴식 즐기기",
    theme_break_title_short: "달콤한 휴식 취하기",
    theme_break_var0_activity: "금빛 해먹에 누워 여유 즐기기",
    theme_break_var1_activity: "따뜻한 온천수에 몸 담그기",
    theme_break_var2_activity: "신비로운 무알콜 칵테일 음미하기",

    theme_skill_title: "새로운 기술 배우기",
    theme_skill_title_short: "새로운 스킬 배우기",
    theme_skill_var0_activity: "뜨거운 유리로 불사조 모양 빚기",
    theme_skill_var1_activity: "웅장한 오케스트라 지휘하기",
    theme_skill_var2_activity: "e스포츠 챔피언십 우승하기",

    theme_creative_title: "더욱 창의적으로 변하기",
    theme_creative_title_short: "창의성 깨우기",
    theme_creative_var0_activity: "거대한 꽃 조각상 만들기",
    theme_creative_var1_activity: "화려한 그래피티 벽화 그리기",
    theme_creative_var2_activity: "환상적인 빛의 오케스트라 지휘하기",

    theme_imagination_title: "상상력 마음껏 발휘하기",
    theme_imagination_title_short: "무한한 상상력 펼치기",
    theme_imagination_var0_activity: "거대한 번개구름 속 뚫고 비행하기",
    theme_imagination_var1_activity: "호기심 많은 드래곤과 대화하기",
    theme_imagination_var2_activity: "거대한 시간의 톱니바퀴 되감기",

    theme_green_title: "그린 위의 마스터",
    theme_green_title_short: "그린 위의 마스터",
    theme_green_var0_activity: "토너먼트 우승을 확정 짓는 완벽한 퍼팅 성공하기",
    theme_green_var1_activity: "완벽한 점프 백핸드 스매시 날리기",
    theme_green_var2_activity: "환상적인 노을을 향해 티샷 날리기",

    theme_culinary_title: "숨겨진 미식가 본능",
    theme_culinary_title_short: "숨겨진 미식가 본능",
    theme_culinary_var0_activity: "분자 요리의 걸작 맛보기",
    theme_culinary_var1_activity: "완벽하게 플레이팅된 트러플 리조또 즐기기",
    theme_culinary_var2_activity: "전문가와 함께 희귀한 화이트 트러플 채집하기",

    theme_warrior_title: "열정적인 주말 액티비티",
    theme_warrior_title_short: "열정적인 주말 액티비티",
    theme_warrior_var0_activity: "거대한 흙탕물 위로 멋지게 점프하기",
    theme_warrior_var1_activity: "새하얀 파우더 스노우 위를 스노보드로 가르기",
    theme_warrior_var2_activity: "날렵한 카본 카약 능숙하게 조종하기",

    theme_racing_title: "짜릿한 그랑프리 레이싱",
    theme_racing_title_short: "짜릿한 그랑프리 레이싱",
    theme_racing_var0_activity: "맹렬한 엔진음의 빈티지 페라리 몰기",
    theme_racing_var1_activity: "시상대 정상에서 1위 우승 축하하기",
    theme_racing_var2_activity: "르망 하이퍼카 옆에서 주행 데이터 분석하기",

    theme_alpine_title: "알프스 설산 정복",
    theme_alpine_title_short: "알프스 설산 정복",
    theme_alpine_var0_activity: "얼음도끼를 들고 승리감에 취해 정상에 서기",
    theme_alpine_var1_activity: "강렬한 집중력으로 프리 클라이밍 하기",
    theme_alpine_var2_activity: "짜릿한 헬기 강하 후 새하얀 설원의 첫 트랙 가르기",

    // --- Kiosk Flow: Caption ---
    caption_default: "Gemini 덕분에 자유 시간 만끽하기",
    caption_zen: "Gemini 덕분에 마음의 평화 찾기",
    caption_break: "Gemini 덕분에 즐기는 꿀맛 같은 휴식",
    caption_creative: "Gemini 덕분에 더욱 창의적으로 변하기",
    caption_recipe: "Gemini 덕분에 새로운 레시피 배우기",
    caption_active: "Gemini 덕분에 더욱 활동적으로 변하기",
    caption_skill: "Gemini 덕분에 새로운 기술 배우기",
    caption_imagination: "Gemini 덕분에 상상력 마음껏 발휘하기",
    caption_green: "Gemini 덕분에 그린 위의 마스터 되기",
    caption_culinary: "Gemini 덕분에 숨겨진 미식가 본능 만끽하기",
    caption_warrior: "Gemini 덕분에 열정적인 주말 액티비티 즐기기",
    caption_racing: "Gemini 덕분에 짜릿한 그랑프리 레이싱 즐기기",
    caption_alpine: "Gemini 덕분에 알프스 설산 정복하기",

    // --- Kiosk Flow: Loading ---
    loading_message_0: "Gemini가 당신이 꿈꾸는 일상을 상상하는 중...",
    loading_message_1: "개성 있는 포즈를 분석하는 중...",
    loading_message_2: "고급 예술 스타일을 적용하는 중...",
    loading_message_3: "완벽한 배경 환경을 구성하는 중...",
    loading_message_4: "영화 디테일을 다듬는 중...",
    loading_subtitle: "Powered by Gemini",

    // --- Kiosk Flow: Results & Refine ---
    result_title: "짜잔!",
    result_subtitle: "QR 코드를 스캔하여 나만의 마스터피스를 다운로드하세요.",
    btn_adjust_style: "스타일 변경하기",
    btn_done: "다 했어요!",

    // --- Kiosk Sub-Flow: Refine ---
    refine_description: "이제 가장 재미있는 단계입니다. 프롬프트를 다듬어 최종 이미지를 만들어 보세요.",
    refine_label_imagine: "상상해 보세요: 나는",
    refine_label_style: "표현 스타일",

    // --- Kiosk Sub-Flow: Refine Titles ---
    refine_greet_recipe: "오늘의 셰프는\n바로 당신!",
    refine_greet_zen: "마음의 평화를\n찾은 모습이네요!",
    refine_greet_active: "에너지가 넘치는\n멋진 모습이네요!",
    refine_greet_break: "달콤한 휴식을\n즐기는 중!",
    refine_greet_skill: "프로처럼 멋지게\n레벨 업!",
    refine_greet_creative: "예술적 영감이\n빛나는 순간!",
    refine_greet_imagination: "무한한 상상력이\n펼쳐지는 중!",
    refine_greet_green: "프로 선수처럼\n멋진 폼이네요!",
    refine_greet_culinary: "진정한 미식을 즐길 줄 아는\n매력적인 모습이네요!",
    refine_greet_warrior: "와일드한 모험을\n떠날 준비 완료?",
    refine_greet_racing: "오늘 트랙의\n선두주자네요!",
    refine_greet_alpine: "새로운 정상을\n정복할 기세네요!",
    refine_greet_default: "정말 멋진걸요!",

    // --- Kiosk Flow: Thanks ---
    thanks_title: "나만의 여유를 즐겨보세요!",
    thanks_start_over: "새로 촬영하기",

    // --- Download Page ---
    loading_download_caption: "상상 속 일상을 현실로 꺼내는 중...",
    btn_download: "폴라로이드 저장하기",
    download_caption: "Gemini가 당신의 개성 있는 포즈를 바탕으로 새롭게 상상해 낸 여유로운 일상의 모습입니다"
  },
  jp: {
    // --- Home Page ---
    home_title_main: "The Free-Time Machine",
    home_description: "Gemini のおかげで、毎週最大10時間の自由時間を取り戻す自分を想像してみてください",
    home_start_button: "開始",
    home_link_details: "Gemini が、教員やリーダーが毎週最大 10 時間を節約するのにどのように役立っているかをご覧ください。",
    home_consent_title: "はじめる前に",
    home_consent_desc: "Gemini Free-Time Machine は、Google の最新の生成画像モデルである Nano Banana Pro を使用した新しいテクノロジー体験です。\n\n写真を撮ると、選択したエフェクトを使用して画像が作成されます。写真を送信することにより、18歳以上であることを確認し、画像の生成のために Google が画像を処理することに同意したことになります。画像をダウンロードするには、最後に提供されるQRコードをスキャンしてください。",
    home_consent_accept: "同意して進む",
    home_consent_decline: "同意しない",
    home_consent_loading: "準備してください...",

    // --- Study Page ---
    study_header: "教育者を支援: Gemini が教室の変革をどのように支援しているか",
    study_body_1: "北アイルランドの100人の教師が参加した最近の6か月にわたるパイロットプログラムにより、Gemini を教室に統合することは教育を近代化するだけでなく、教師に最も貴重なリソースである「時間」を返すことが明らかになりました。",
    study_head_2: "毎週10時間の節約", 
    study_body_2: "参加した教師は Gemini を使用して時間のかかる管理タスクを処理することで、平均して毎週10時間を節約しました。",
    study_head_3: "教育のための時間の増加",
    study_body_3: "教師はこの節約された時間を、学生のエンゲージメントと自分自身の専門能力開発に直接再投資しました。",
    study_head_4: "600以上のユニークなユースケース",
    study_body_4: "リスク評価の起草からクリエイティブなコンテンツのブレインストーミングまで、教育者は業務を合理化する何百もの方法を見つけました。",
    btn_continue: "続行",
    

    // --- Kiosk Flow: Camera ---
    camera_title: "ポーズを決めましょう！",
    camera_btn_take: "写真を撮る",
    camera_btn_retake: "写真を取り直す",
    camera_rdy_title: "準備してください...",
    camera_continue_subtitle: "いい感じに撮れましたか？",
    camera_btn_continue: "完璧です！",
    
    // --- Kiosk Flow: Themes & Styles ---
    theme_title: "自由な時間は何をしたいですか？",
    style_title: "スタイルを選択してください",
    btn_back: "戻る",
    btn_surprise: "おまかせで！",
    btn_generate: "この内容で更新する",


    // --- Kiosk Flow: Dynamic UI ---
    camera_smile: "そのまま動かないで...",
    camera_wheelchair: "私は車椅子を利用しています",
    
    // --- STYLES ---
    style_figurine_title: "フィギュア",
    style_keychain_title: "3Dキーホルダー",
    style_oil_title: "油彩画",
    style_clay_title: "クレイアニメ",
    style_editorial_title: "ファッション誌",
    style_cinematic_title: "シネマティック",
    style_noir_title: "クラシック・ノワール",
    style_visionary_title: "近未来SF",

    // --- THEMES ---
    theme_recipe_title: "新しい料理に挑戦する",
    theme_recipe_var0_activity: "生パスタの生地をこねる",
    theme_recipe_var1_activity: "液体窒素で食べられるアートを作る",
    theme_recipe_var2_activity: "職人技でピザ生地を回す",

    theme_zen_title: "リラックスする",
    theme_zen_var0_activity: "ゆっくりと優雅に太極拳をする",
    theme_zen_var1_activity: "無重力空間で深く瞑想する",
    theme_zen_var2_activity: "古代樹の囁きに耳を澄ます",

    theme_active_title: "もっとアクティブになる",
    theme_active_var0_activity: "高速パルクールをマスターする",
    theme_active_var1_activity: "機械のイルカと一緒に泳ぐ",
    theme_active_var2_activity: "垂直な岩山をロッククライミングする",

    theme_break_title: "ご褒美の休息をとる",
    theme_break_var0_activity: "黄金のハンモックでくつろぐ",
    theme_break_var1_activity: "湯気立つミネラル泉に浸かる",
    theme_break_var2_activity: "宇宙気分のモクテルを味わう",

    theme_skill_title: "新しいスキルを学ぶ",
    theme_skill_var0_activity: "溶けたガラスで不死鳥を形作る",
    theme_skill_var1_activity: "オーケストラの指揮をする",
    theme_skill_var2_activity: "プロゲーミング大会で優勝する",

    theme_creative_title: "もっとクリエイティブになる",
    theme_creative_var0_activity: "巨大な花の彫刻を作る",
    theme_creative_var1_activity: "鮮やかな壁画をスプレーペイントする",
    theme_creative_var2_activity: "光のオーケストラを指揮する",

    theme_imagination_title: "想像力を解き放つ",
    theme_imagination_var0_activity: "雷雲の中を駆け抜ける",
    theme_imagination_var1_activity: "好奇心旺盛なドラゴンと話す",
    theme_imagination_var2_activity: "時の歯車を巻き戻す",

    theme_green_title: "緑のフィールドを極める",
    theme_green_var0_activity: "優勝を決める完璧なパットを沈める",
    theme_green_var1_activity: "完璧なジャンピング バックハンド スマッシュを決める",
    theme_green_var2_activity: "壮大な夕日に向かってティーオフする",

    theme_culinary_title: "グルメを堪能する",
    theme_culinary_var0_activity: "分子ガストロノミーの傑作を味わう",
    theme_culinary_var1_activity: "完璧に盛り付けられたトリュフ リゾットを楽しむ",
    theme_culinary_var2_activity: "熟練ガイドと希少な白トリュフを探す",

    theme_warrior_title: "週末を思い切りアクティブに過ごす",
    theme_warrior_var0_activity: "巨大なダートジャンプで宙を舞う",
    theme_warrior_var1_activity: "スノーボードで新雪のパウダーを滑る",
    theme_warrior_var2_activity: "洗練されたカーボン カヤックを巧みに操る",

    theme_racing_title: "レースのスリルを追い求める",
    theme_racing_var0_activity: "轟音を立てるヴィンテージ フェラーリを運転する",
    theme_racing_var1_activity: "表彰台の頂点で1位を祝う",
    theme_racing_var2_activity: "ル・マンのハイパーカーの横でデータを分析する",

    theme_alpine_title: "アルプスの山々を制覇する",
    theme_alpine_var0_activity: "ピッケルを手に勝利のポーズで立つ",
    theme_alpine_var1_activity: "究極の集中力とグリップでフリークライミングする",
    theme_alpine_var2_activity: "ヘリスキーで山頂に降り立ち、最初のシュプールを描く",

    // --- Kiosk Flow: Caption ---
    caption_default: "Gemini のおかげで、素敵な時間を過ごせました。",
    caption_zen: "Gemini のおかげで、心穏やかなひとときを過ごせました。",
    caption_break: "Gemini のおかげで、最高のリラックスタイムを過ごせました。",
    caption_creative: "Gemini のおかげで、創造力がもっと広がりました。",
    caption_recipe: "Gemini のおかげで、新しい料理に挑戦できました。",
    caption_active: "Gemini のおかげで、もっとアクティブに過ごせました。",
    caption_skill: "Gemini のおかげで、新しいスキルが身につきました。",
    caption_imagination: "Gemini のおかげで、想像力を思い切り解き放つことができました。",
    caption_green: "Gemini のおかげで、最高のプレーができました。",
    caption_culinary: "Gemini のおかげで、美味しいものをお腹いっぱい楽しみました。",
    caption_warrior: "Geminiのおかげで、週末を思い切りアクティブに楽しめました。",
    caption_racing: "Gemini のおかげで、レースの興奮を間近で味わえました。",
    caption_alpine: "Gemini のおかげで、アルプスの山々を制覇しました。",

    // --- Kiosk Flow: Loading ---
    loading_message_0: "Geminiがあなたの理想の姿を描いています...",
    loading_message_1: "ポーズを分析しています...",
    loading_message_2: "最高の背景を作成しています...",
    loading_message_3: "細部までこだわって仕上げています...",
    loading_message_4: "上質なアートスタイルを適用しています...",
    loading_subtitle: "Powered by Gemini",

    // --- Kiosk Flow: Results & Refine ---
    result_title: "ジャーン！完成です！",
    result_subtitle: "コードをスキャンして、最高の1枚をダウンロードしてください。",
    btn_adjust_style: "スタイルを調整する",
    btn_done: "これで完了！",

    // --- Kiosk Sub-Flow: Refine ---
    refine_description: "さあ、ここからが楽しい時間です。プロンプトを調整して、最高の1枚を完成させましょう。",
    refine_label_imagine: "こんな姿を描いて",
    refine_label_style: "スタイル",

    // --- Kiosk Sub-Flow: Refine Titles ---
    refine_greet_recipe: "素晴らしい料理ができそうですね！",
    refine_greet_zen: "心穏やかなひとときですね！",
    refine_greet_active: "エネルギーに満ちあふれていますね！",
    refine_greet_break: "最高のリラックスタイムですね！",
    refine_greet_skill: "プロ顔負けの仕上がりですね！",
    refine_greet_creative: "創造力が光っていますね！",
    refine_greet_imagination: "独創的なアイデアですね！",
    refine_greet_green: "プロ選手のようにキマっていますね！",
    refine_greet_culinary: "美味しそうな香りがしてきそうです！",
    refine_greet_warrior: "冒険の準備はバッチリですね！",
    refine_greet_racing: "トップを独走していますね！",
    refine_greet_alpine: "新たな高みへ到達しましたね！",
    refine_greet_default: "とてもいい感じです！",

    // --- Kiosk Flow: Thanks ---
    thanks_title: "素敵な時間をお過ごしください！",
    thanks_start_over: "最初からやり直す",

    // --- Download Page ---
    loading_download_caption: "画像を準備しています...",
    btn_download: "ポラロイド画像をダウンロード",
    download_caption: "この画像は Gemini によって生成されました。あなたのポーズをもとに、理想の過ごし方を描いています。"
  },
  tc: {
    // --- Home Page ---
    home_title_main: "The Free-Time Machine",
    home_description: "想像一下，得益於 Gemini，您接下來每週最多都能省下 10 個小時...",
    home_start_button: "準備好了？開始！",
    home_link_details: "瞭解 Gemini 如何幫助教師和管理者每週節省長達 10 小時的時間。",
    home_consent_title: "開始之前...",
    home_consent_desc: "The Free-Time Machine 是一個使用 Google 最先進的圖像模型 Nano Banana Pro 的實驗。\n\n拍張照片後選擇不同的指令創造一張屬於您的圖片。提交您的照片即代表您確認您已年滿 18 歲，並同意 Google 使用您的照片並將其運用在圖像生成。若想要下載完成圖檔，請於最後掃描 QR Code，以取得屬於您的電子檔案。",
    home_consent_accept: "接受並繼續",
    home_consent_decline: "不接受",
    home_consent_loading: "連線中...",

    // --- Study Page ---
    study_header: "賦能教育工作者：Gemini 如何幫助改變課堂",
    study_body_1: `最近在北愛爾蘭有 100 名教師參與的一項為期六個月的試驗計畫項目，他們將 Gemini 融入課堂，不僅使教育現代化還將教師最寶貴的資源 —— "時間" 還給了他們。`,
    study_head_2: "每週節省 10 小時", 
    study_body_2: "平均而言，參與的教師每週透過使用 Gemini 處理耗時的行政作業節省了 10 小時。",
    study_head_3: "更多教學時間",
    study_body_3: "教師將節省下來的時間投入提升學生課堂參與和自身的專業發展。",
    study_head_4: "600 多個獨特的案例",
    study_body_4: "從起草風險評估到集思廣益地構思創意內容，教育工作者找到了數百種方法來簡化他們的工作流程。",
    btn_continue: "繼續",
    

    // --- Kiosk Flow: Camera ---
    camera_title: "準備...",
    camera_btn_take: "按下拍照",
    camera_btn_retake: "再拍一張",
    camera_rdy_title: "請準備...",
    camera_continue_subtitle: "看起來不錯？",
    camera_btn_continue: "就是這張了！",
    
    // --- Kiosk Flow: Themes & Styles ---
    theme_title: "空閒時間，您想做什麼呢？",
    style_title: "選擇您的風格",
    btn_back: "取消",
    btn_surprise: "隨機變身！",
    btn_generate: "更新",


    // --- Kiosk Flow: Dynamic UI ---
    camera_smile: "請保持不動...",
    camera_wheelchair: "我是輪椅使用者",
    
    // --- STYLES ---
    style_figurine_title: "公仔",
    style_keychain_title: "3D 鑰匙扣",
    style_oil_title: "油畫",
    style_clay_title: "黏土風動畫",
    style_editorial_title: "雜誌封面",
    style_cinematic_title: "電影史詩",
    style_noir_title: "黑白攝影",
    style_visionary_title: "科幻",

    // --- THEMES ---
    theme_recipe_title: "學習新食譜",
    theme_recipe_var0_activity: "揉製新鮮義大利麵麵團",
    theme_recipe_var1_activity: "創作精緻料理搭配乾冰藝術",
    theme_recipe_var2_activity: "拋擲出完美的手工披薩",

    theme_zen_title: "找尋我的平靜",
    theme_zen_var0_activity: "優雅的練習太極拳",
    theme_zen_var1_activity: "零重力環境下進行深度冥想",
    theme_zen_var2_activity: "聆聽森林的低語",

    theme_active_title: "讓自己動起來",
    theme_active_var0_activity: "掌握高速跑酷技巧",
    theme_active_var1_activity: "與機械海豚一起游泳",
    theme_active_var2_activity: "垂直攀岩",

    theme_break_title: "享受應得的休息時間",
    theme_break_var0_activity: "慵懶地躺在金色吊床上",
    theme_break_var1_activity: "享受熱氣騰騰的溫泉",
    theme_break_var2_activity: "啜飲精緻無酒精雞尾酒",

    theme_skill_title: "學習一項新技能",
    theme_skill_var0_activity: "將玻璃鑄造成鳳凰的樣子",
    theme_skill_var1_activity: "指揮一支交響樂團",
    theme_skill_var2_activity: "贏得職業遊戲錦標賽",

    theme_creative_title: "讓自己變得更有創意",
    theme_creative_var0_activity: "雕刻巨型花卉雕像",
    theme_creative_var1_activity: "噴繪色彩鮮豔的壁畫",
    theme_creative_var2_activity: "指揮燈光交響樂",

    theme_imagination_title: "放飛我的想像力",
    theme_imagination_var0_activity: "飛越雷雲",
    theme_imagination_var1_activity: "與好奇心旺盛的龍聊天",
    theme_imagination_var2_activity: "讓時間倒流",

    theme_green_title: "稱霸綠茵場",
    theme_green_var0_activity: "完美的打出一桿進洞",
    theme_green_var1_activity: "展現完美的躍起反手扣殺",
    theme_green_var2_activity: "在橘色天空日落中開球",

    theme_culinary_title: "滿足我內心的美食家",
    theme_culinary_var0_activity: "品嚐摘星料理的傑作",
    theme_culinary_var1_activity: "享用擺盤精美的松露燴飯",
    theme_culinary_var2_activity: "跟著導遊去探索珍稀白松露",

    theme_warrior_title: "釋放週末的勇士本能",
    theme_warrior_var0_activity: "在巨大的跳台上騰空而起",
    theme_warrior_var1_activity: "在滑雪場上畫出俐落的粉雪痕跡",
    theme_warrior_var2_activity: "熟練地駕駛著流線型的划艇",

    theme_racing_title: "熱情參加各種大獎賽",
    theme_racing_var0_activity: "駕駛一輛拉風的經典法拉利",
    theme_racing_var1_activity: "慶祝登上頒獎台獲得第一名",
    theme_racing_var2_activity: "在利曼超級賽車旁邊分析數據",

    theme_alpine_title: "征服阿爾卑斯山",
    theme_alpine_var0_activity: "自信的手持冰柱",
    theme_alpine_var1_activity: "全神貫注的徒手攀登",
    theme_alpine_var2_activity: "刺激的空降後闢出一道冰道",

    // --- Kiosk Flow: Caption ---
    caption_default: "謝謝 Gemini，讓我盡情享受自由時光",
    caption_zen: "謝謝 Gemini，我找到讓我平靜的方式",
    caption_break: "謝謝 Gemini，我享受了我的休息時間",
    caption_creative: "謝謝 Gemini，我變得更有創意了",
    caption_recipe: "謝謝 Gemini，我學會了一個新的食譜",
    caption_active: "謝謝 Gemini，我變得更活躍了",
    caption_skill: "謝謝 Gemini，我學了一項新技能",
    caption_imagination: "謝謝 Gemini，我放飛了想像力",
    caption_green: "謝謝 Gemini，讓我化身綠茵大師",
    caption_culinary: "謝謝 Gemini，我盡情釋放了內心的美食家本能",
    caption_warrior: "謝謝 Gemini，我釋放了週末挑戰潛能",
    caption_racing: "謝謝 Gemini，我成為了賽事大獎得主",
    caption_alpine: "謝謝 Gemini，我征服了阿爾卑斯山",

    // --- Kiosk Flow: Loading ---
    loading_message_0: "Gemini 正在構想您的夢想生活…",
    loading_message_1: "分析您獨特的姿態…",
    loading_message_2: "打造完美環境…",
    loading_message_3: "精雕細琢電影級細節…",
    loading_message_4: "搭配精品藝術風格…",
    loading_subtitle: "由 Gemini 提供技術支持",

    // --- Kiosk Flow: Results & Refine ---
    result_title: "完成！",
    result_subtitle: "省下的 10 小時讓您看起來棒極了！掃描以下載和保存電子檔。",
    btn_adjust_style: "調整照片",
    btn_done: "已掃描完畢!",

    // --- Kiosk Sub-Flow: Refine ---
    refine_description: "準備好迎接有趣的部分了嗎？優化您的指令來產生最終圖片。",
    refine_label_imagine: "想像我",
    refine_label_style: "選擇您的風格",

    // --- Kiosk Sub-Flow: Refine Titles ---
    refine_greet_recipe: "烹飪風暴來襲！",
    refine_greet_zen: "找到內心的平靜...",
    refine_greet_active: "能量爆棚！",
    refine_greet_break: "盡情享受放鬆時刻...",
    refine_greet_skill: "像專業人士一樣升級！",
    refine_greet_creative: "迸出純粹的靈感！",
    refine_greet_imagination: "構思出天馬行空的創意！",
    refine_greet_green: "帥氣十足，專業玩家！",
    refine_greet_culinary: "今天要吃什麼料理呢？",
    refine_greet_warrior: "準備好迎接挑戰了嗎？",
    refine_greet_racing: "碾壓賽場成為領頭羊！",
    refine_greet_alpine: "跟我一起攀上新高峰！",
    refine_greet_default: "看起來太棒啦！",

    // --- Kiosk Flow: Thanks ---
    thanks_title: "好好享受你的空閒時間！",
    thanks_start_over: "重新開始",

    // --- Download Page ---
    loading_download_caption: "加載中...",
    btn_download: "下載照片",
    download_caption: "這個願景是與 Gemini 一起創造的，根據你獨特的想法讓空閒的時間有無限可能。"
  }
};

export type TranslationKey = keyof typeof dictionaries.en;
