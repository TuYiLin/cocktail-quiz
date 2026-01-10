export const questions = [
    {
        id: 1,
        type: "recipe",
        question: "製作經典的【莫希托 Mojito】時，必須搗碎(Muddle)哪種新鮮香草？",
        options: ["羅勒 (Basil)", "迷迭香 (Rosemary)", "薄荷 (Mint)", "百里香 (Thyme)"],
        correct: 2,
        explanation: "Mojito 的靈魂在於新鮮薄荷葉釋放的清香油份。記得不要搗太碎，否則會變苦澀！"
    },
    {
        id: 2,
        type: "glassware",
        question: "【馬丁尼 Martini】通常使用什麼形狀的酒杯盛裝？",
        options: ["V型高腳杯 (V-shape)", "平底杯 (Tumbler)", "颶風杯 (Hurricane)", "香檳笛杯 (Flute)"],
        correct: 0,
        explanation: "經典的 V 型高腳杯設計可以防止手的溫度影響酒液，並讓香氣集中。"
    },
    {
        id: 3,
        type: "recipe",
        question: "【長島冰茶 Long Island Iced Tea】雖然叫茶，但其實不含茶。請問它包含幾種基酒？",
        options: ["2種", "3種", "4種", "5種"],
        correct: 2, /* Vodka, Rum, Gin, Tequila + Cointreau(Liqueur) -> 4 spirits usually considered "base" in this context but strictly 4 bases + 1 liqueur. Let's stick to 4 bases convention or clarify. Standard: Vodka, Rum, Gin, Tequila. */
        explanation: "標準長島冰茶使用四大基酒：伏特加、琴酒、蘭姆酒、龍舌蘭，再加上君度橙酒(利口酒)和可樂調色。"
    },
    {
        id: 4,
        type: "knowledge",
        question: "調酒術語中，【Straight Up】(純飲/不加冰) 通常是指？",
        options: ["常溫直接倒入杯中", "經過冰鎮攪拌/搖盪後，濾掉冰塊倒入高腳杯", "加滿冰塊直接喝", "只加水稀釋"],
        correct: 1,
        explanation: "Straight Up 意味著酒液經過冰鎮(Chilled)但端上來時杯中沒有冰塊，通常用於馬丁尼等短飲。"
    },
    {
        id: 5,
        type: "recipe",
        question: "【柯夢波丹 Cosmopolitan】因為《慾望城市》而爆紅，它的粉紅色澤來自？",
        options: ["草莓糖漿", "紅石榴糖漿 (Grenadine)", "蔓越莓汁 (Cranberry Juice)", "西瓜汁"],
        correct: 2,
        explanation: "蔓越莓汁賦予了柯夢波丹標誌性的粉紅色與酸甜口感，搭配伏特加與橙酒。"
    },
    {
        id: 6,
        type: "recipe",
        question: "【Old Fashioned】被稱為雞尾酒的始祖，它通常以哪種基酒為主體？",
        options: ["威士忌 (Whisky)", "伏特加 (Vodka)", "琴酒 (Gin)", "龍舌蘭 (Tequila)"],
        correct: 0,
        explanation: "最經典的 Old Fashioned 使用美國波本威士忌或裸麥威士忌，加入苦精、糖和橙皮。"
    },
    {
        id: 7,
        type: "garnish",
        question: "【琴湯尼 Gin & Tonic】最經典的裝飾(Garnish)通常是？",
        options: ["櫻桃", "檸檬/萊姆角 (Lemon/Lime Wedge)", "橄欖", "鳳梨片"],
        correct: 1,
        explanation: "萊姆或檸檬的酸度與精油能完美襯托琴酒的杜松子香氣與通寧水的微苦。"
    },
    {
        id: 8,
        type: "knowledge",
        question: "【B-52 轟炸機】是一種分層調酒(Layered)，它是利用液體的什麼特性分層的？",
        options: ["溫度", "酒精濃度", "比重 (密度)", "黏稠度"],
        correct: 2,
        explanation: "利用糖分含量不同的利口酒產生的「比重」差異，糖分越高越重沉在下面，越輕浮在上面。"
    },
    {
        id: 9,
        type: "recipe",
        question: "被稱為「失身酒」的【環遊世界 Around the World】，特色是什麼？",
        options: ["沒有酒精", "混合了幾乎所有基酒與果汁，酒感被掩蓋", "只用啤酒調製", "喝起來像感冒糖漿"],
        correct: 1,
        explanation: "因為混合多種基酒、利口酒與果汁(如鳳梨汁)，口感酸甜容易入口，但酒精濃度其實很高。"
    },
    {
        id: 10,
        type: "glassware",
        question: "【Margarita 瑪格麗特】杯口通常會做什麼處理？",
        options: ["抹鹽 (Salt Rim)", "抹糖 (Sugar Rim)", "抹辣椒粉", "不處理"],
        correct: 0,
        explanation: "鹽口杯 (Salt Rim) 是瑪格麗特的標誌，鹽分能平衡檸檬的酸並帶出龍舌蘭的甜味。"
    }
];
