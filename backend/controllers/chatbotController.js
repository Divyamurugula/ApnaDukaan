const Product = require('../models/Product');
const Shop    = require('../models/Shop');

const CATEGORY_MAP = {
  vegetable: 'vegetables', veggies: 'vegetables', veggie: 'vegetables',
  sabzi: 'vegetables',     greens: 'vegetables',  salad: 'vegetables',
  fruit: 'vegetables',     fruits: 'vegetables',
  dairy: 'dairy',   milk: 'dairy',   doodh: 'dairy',  curd: 'dairy',
  paneer: 'dairy',  cheese: 'dairy', butter: 'dairy', ghee: 'dairy',
  bread: 'bakery',  bakery: 'bakery', cake: 'bakery', biscuit: 'bakery',
  roti: 'bakery',   pav: 'bakery',
  grocery: 'grocery',   groceries: 'grocery', dal: 'grocery',
  rice: 'grocery',  chawal: 'grocery', atta: 'grocery', flour: 'grocery',
  oil: 'grocery',   spice: 'grocery',  masala: 'grocery',
  medicine: 'pharmacy', pharmacy: 'pharmacy', tablet: 'pharmacy', medical: 'pharmacy',
  beverage: 'general',  juice: 'general', drink: 'general',
};

const SHOP_FIELDS    = 'shopName location rating isOpen openingHours';
const CATEGORY_FIELD = 'name';

const fetchRelevantProducts = async (message) => {
  const lower    = message.toLowerCase();
  const keywords = lower.replace(/[^a-z0-9 ]/g, '').trim();
  let products   = [];

  // 1. Text search (needs index — safe try/catch)
  if (keywords.length > 2) {
    try {
      products = await Product.find({ $text: { $search: keywords }, isAvailable: true })
        .populate('shop', SHOP_FIELDS).populate('category', CATEGORY_FIELD).limit(8);
    } catch (_) {}
  }

  // 2. Regex on productName (no index needed)
  if (products.length === 0 && keywords.length > 2) {
    try {
      products = await Product.find({
        productName: { $regex: keywords, $options: 'i' }, isAvailable: true,
      }).populate('shop', SHOP_FIELDS).populate('category', CATEGORY_FIELD).limit(8);
    } catch (_) {}
  }

  // 3. Category keyword match
  if (products.length === 0) {
    let matchedCategory = null;
    for (const [word, cat] of Object.entries(CATEGORY_MAP)) {
      if (lower.includes(word)) { matchedCategory = cat; break; }
    }
    if (matchedCategory) {
      try {
        const shops = await Shop.find({ category: matchedCategory, isActive: true }).limit(10);
        products = await Product.find({
          isAvailable: true,
          $or: [
            { shop: { $in: shops.map(s => s._id) } },
            { category: new RegExp(matchedCategory, 'i') },
          ],
        }).populate('shop', SHOP_FIELDS).populate('category', CATEGORY_FIELD)
          .sort({ rating: -1 }).limit(8);
      } catch (_) {}
    }
  }

  // 4. Final fallback — top rated
  if (products.length === 0) {
    try {
      products = await Product.find({ isAvailable: true })
        .populate('shop', SHOP_FIELDS).populate('category', CATEGORY_FIELD)
        .sort({ rating: -1 }).limit(5);
    } catch (_) {}
  }

  return products;
};

const buildPlainReply = (products, message) => {
  if (products.length === 0) {
    return `I searched for "${message}" but couldn't find matching products right now.\n\nTry browsing our Shops page — you can filter by category there! 🛍️`;
  }
  const lines = products.map(p =>
    `🛒 ${p.productName} — ₹${p.discountedPrice || p.price}/${p.unit}\n` +
    `   🏪 ${p.shop?.shopName || 'Local Shop'} — ${p.shop?.isOpen ? '🟢 Open' : '🔴 Closed'}` +
    (p.discountedPrice ? `\n   🏷️ Sale! Was ₹${p.price}` : '')
  );
  return `Here's what I found for you:\n\n${lines.join('\n\n')}\n\nTap a shop to order! 🛍️`;
};

exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.json({ success: true, reply: 'Please type something to search! 😊' });
    }

    const products = await fetchRelevantProducts(message);

    const hasOpenAI = process.env.OPENAI_API_KEY &&
                      process.env.OPENAI_API_KEY !== 'your_openai_key' &&
                      process.env.OPENAI_API_KEY.startsWith('sk-');

    if (!hasOpenAI) {
      return res.json({ success: true, reply: buildPlainReply(products, message) });
    }

    try {
      const { ChatOpenAI } = require('@langchain/openai');
      const llm = new ChatOpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: 'gpt-3.5-turbo',
        temperature: 0.4,
      });
      const dbContext = products.length === 0
        ? 'No matching products found.'
        : products.map(p =>
            `• ${p.productName} — ₹${p.discountedPrice || p.price}/${p.unit} ` +
            `at "${p.shop?.shopName}" (${p.shop?.isOpen ? 'Open' : 'Closed'})`
          ).join('\n');

      const response = await llm.invoke([
        { role: 'system', content: `You are ApnaBot for ApnaDukaan India grocery app. Answer ONLY using the product data provided. Never make up products or prices. Keep response 3-5 lines, friendly.` },
        { role: 'user',   content: `Customer asked: "${message}"\n\nReal products:\n${dbContext}\n\nRespond based only on above data.` },
      ]);
      return res.json({ success: true, reply: response.content });
    } catch (openAIError) {
      console.error('OpenAI error:', openAIError.message);
      return res.json({ success: true, reply: buildPlainReply(products, message) });
    }

  } catch (error) {
    console.error('Chatbot error:', error.message);
    return res.json({
      success: true,
      reply: "I couldn't search right now. Please browse our Shops page! 🛍️",
    });
  }
};

exports.getRecommendations = async (req, res) => {
  try {
    const { category, shopId } = req.query;
    const query = { isAvailable: true };
    if (category) query.category = category;
    if (shopId)   query.shop     = shopId;
    const products = await Product.find(query)
      .populate('shop', 'shopName rating location isOpen')
      .populate('category', 'name')
      .sort({ rating: -1 }).limit(8);
    res.json({ success: true, recommendations: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.clearSession = async (req, res) => {
  res.json({ success: true, message: 'Session cleared' });
};