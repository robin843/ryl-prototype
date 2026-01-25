// Curated list of well-known brands for aspirational display
// These are NOT registered brands - they serve as placeholders for future outreach
// Using brand logos from Clearbit (most reliable) with fallbacks

export interface AspirationalBrand {
  id: string;
  name: string;
  logo_url: string;
  website_url: string;
  industry: string;
}

// Helper to generate Clearbit logo URL (smaller size to avoid throttling)
const logo = (domain: string) => `https://logo.clearbit.com/${domain}?size=128`;

export const aspirationalBrands: AspirationalBrand[] = [
  // Fashion & Sportswear
  { id: 'nike', name: 'Nike', logo_url: logo('nike.com'), website_url: 'https://nike.com', industry: 'Sportswear' },
  { id: 'adidas', name: 'Adidas', logo_url: logo('adidas.com'), website_url: 'https://adidas.com', industry: 'Sportswear' },
  { id: 'puma', name: 'Puma', logo_url: logo('puma.com'), website_url: 'https://puma.com', industry: 'Sportswear' },
  { id: 'reebok', name: 'Reebok', logo_url: logo('reebok.com'), website_url: 'https://reebok.com', industry: 'Sportswear' },
  { id: 'underarmour', name: 'Under Armour', logo_url: logo('underarmour.com'), website_url: 'https://underarmour.com', industry: 'Sportswear' },
  { id: 'newbalance', name: 'New Balance', logo_url: logo('newbalance.com'), website_url: 'https://newbalance.com', industry: 'Sportswear' },
  { id: 'asics', name: 'ASICS', logo_url: logo('asics.com'), website_url: 'https://asics.com', industry: 'Sportswear' },
  { id: 'converse', name: 'Converse', logo_url: logo('converse.com'), website_url: 'https://converse.com', industry: 'Sportswear' },
  { id: 'vans', name: 'Vans', logo_url: logo('vans.com'), website_url: 'https://vans.com', industry: 'Streetwear' },
  { id: 'jordan', name: 'Jordan', logo_url: logo('jordan.com'), website_url: 'https://jordan.com', industry: 'Sportswear' },
  
  // Fast Fashion
  { id: 'zara', name: 'Zara', logo_url: logo('zara.com'), website_url: 'https://zara.com', industry: 'Fashion' },
  { id: 'hm', name: 'H&M', logo_url: logo('hm.com'), website_url: 'https://hm.com', industry: 'Fashion' },
  { id: 'asos', name: 'ASOS', logo_url: logo('asos.com'), website_url: 'https://asos.com', industry: 'Fashion' },
  { id: 'mango', name: 'Mango', logo_url: logo('mango.com'), website_url: 'https://mango.com', industry: 'Fashion' },
  { id: 'uniqlo', name: 'Uniqlo', logo_url: logo('uniqlo.com'), website_url: 'https://uniqlo.com', industry: 'Fashion' },
  { id: 'primark', name: 'Primark', logo_url: logo('primark.com'), website_url: 'https://primark.com', industry: 'Fashion' },
  { id: 'pullbear', name: 'Pull&Bear', logo_url: logo('pullandbear.com'), website_url: 'https://pullandbear.com', industry: 'Fashion' },
  { id: 'bershka', name: 'Bershka', logo_url: logo('bershka.com'), website_url: 'https://bershka.com', industry: 'Fashion' },
  { id: 'aboutyou', name: 'About You', logo_url: logo('aboutyou.de'), website_url: 'https://aboutyou.de', industry: 'Fashion' },
  { id: 'zalando', name: 'Zalando', logo_url: logo('zalando.de'), website_url: 'https://zalando.de', industry: 'Fashion' },
  { id: 'shein', name: 'SHEIN', logo_url: logo('shein.com'), website_url: 'https://shein.com', industry: 'Fashion' },
  { id: 'boohoo', name: 'Boohoo', logo_url: logo('boohoo.com'), website_url: 'https://boohoo.com', industry: 'Fashion' },
  { id: 'prettylittlething', name: 'PrettyLittleThing', logo_url: logo('prettylittlething.com'), website_url: 'https://prettylittlething.com', industry: 'Fashion' },
  { id: 'nastygal', name: 'Nasty Gal', logo_url: logo('nastygal.com'), website_url: 'https://nastygal.com', industry: 'Fashion' },
  { id: 'revolve', name: 'Revolve', logo_url: logo('revolve.com'), website_url: 'https://revolve.com', industry: 'Fashion' },
  { id: 'fashionnova', name: 'Fashion Nova', logo_url: logo('fashionnova.com'), website_url: 'https://fashionnova.com', industry: 'Fashion' },
  
  // Luxury Fashion
  { id: 'gucci', name: 'Gucci', logo_url: logo('gucci.com'), website_url: 'https://gucci.com', industry: 'Luxury' },
  { id: 'louisvuitton', name: 'Louis Vuitton', logo_url: logo('louisvuitton.com'), website_url: 'https://louisvuitton.com', industry: 'Luxury' },
  { id: 'prada', name: 'Prada', logo_url: logo('prada.com'), website_url: 'https://prada.com', industry: 'Luxury' },
  { id: 'chanel', name: 'Chanel', logo_url: logo('chanel.com'), website_url: 'https://chanel.com', industry: 'Luxury' },
  { id: 'dior', name: 'Dior', logo_url: logo('dior.com'), website_url: 'https://dior.com', industry: 'Luxury' },
  { id: 'balenciaga', name: 'Balenciaga', logo_url: logo('balenciaga.com'), website_url: 'https://balenciaga.com', industry: 'Luxury' },
  { id: 'burberry', name: 'Burberry', logo_url: logo('burberry.com'), website_url: 'https://burberry.com', industry: 'Luxury' },
  { id: 'versace', name: 'Versace', logo_url: logo('versace.com'), website_url: 'https://versace.com', industry: 'Luxury' },
  { id: 'armani', name: 'Armani', logo_url: logo('armani.com'), website_url: 'https://armani.com', industry: 'Luxury' },
  { id: 'fendi', name: 'Fendi', logo_url: logo('fendi.com'), website_url: 'https://fendi.com', industry: 'Luxury' },
  { id: 'hermes', name: 'Hermès', logo_url: logo('hermes.com'), website_url: 'https://hermes.com', industry: 'Luxury' },
  { id: 'moncler', name: 'Moncler', logo_url: logo('moncler.com'), website_url: 'https://moncler.com', industry: 'Luxury' },
  { id: 'bottegaveneta', name: 'Bottega Veneta', logo_url: logo('bottegaveneta.com'), website_url: 'https://bottegaveneta.com', industry: 'Luxury' },
  { id: 'celine', name: 'Celine', logo_url: logo('celine.com'), website_url: 'https://celine.com', industry: 'Luxury' },
  { id: 'saintlaurent', name: 'Saint Laurent', logo_url: logo('ysl.com'), website_url: 'https://ysl.com', industry: 'Luxury' },
  { id: 'givenchy', name: 'Givenchy', logo_url: logo('givenchy.com'), website_url: 'https://givenchy.com', industry: 'Luxury' },
  { id: 'valentino', name: 'Valentino', logo_url: logo('valentino.com'), website_url: 'https://valentino.com', industry: 'Luxury' },
  { id: 'loewe', name: 'Loewe', logo_url: logo('loewe.com'), website_url: 'https://loewe.com', industry: 'Luxury' },
  
  // Beauty & Cosmetics
  { id: 'sephora', name: 'Sephora', logo_url: logo('sephora.com'), website_url: 'https://sephora.com', industry: 'Beauty' },
  { id: 'douglas', name: 'Douglas', logo_url: logo('douglas.de'), website_url: 'https://douglas.de', industry: 'Beauty' },
  { id: 'loreal', name: "L'Oréal", logo_url: logo('loreal.com'), website_url: 'https://loreal.com', industry: 'Beauty' },
  { id: 'mac', name: 'MAC Cosmetics', logo_url: logo('maccosmetics.com'), website_url: 'https://maccosmetics.com', industry: 'Beauty' },
  { id: 'maybelline', name: 'Maybelline', logo_url: logo('maybelline.com'), website_url: 'https://maybelline.com', industry: 'Beauty' },
  { id: 'nyx', name: 'NYX', logo_url: logo('nyxcosmetics.com'), website_url: 'https://nyxcosmetics.com', industry: 'Beauty' },
  { id: 'benefit', name: 'Benefit', logo_url: logo('benefitcosmetics.com'), website_url: 'https://benefitcosmetics.com', industry: 'Beauty' },
  { id: 'fenty', name: 'Fenty Beauty', logo_url: logo('fentybeauty.com'), website_url: 'https://fentybeauty.com', industry: 'Beauty' },
  { id: 'glossier', name: 'Glossier', logo_url: logo('glossier.com'), website_url: 'https://glossier.com', industry: 'Beauty' },
  { id: 'clinique', name: 'Clinique', logo_url: logo('clinique.com'), website_url: 'https://clinique.com', industry: 'Skincare' },
  { id: 'esteelauder', name: 'Estée Lauder', logo_url: logo('esteelauder.com'), website_url: 'https://esteelauder.com', industry: 'Beauty' },
  { id: 'lush', name: 'Lush', logo_url: logo('lush.com'), website_url: 'https://lush.com', industry: 'Beauty' },
  { id: 'thebodyshop', name: 'The Body Shop', logo_url: logo('thebodyshop.com'), website_url: 'https://thebodyshop.com', industry: 'Beauty' },
  { id: 'rituals', name: 'Rituals', logo_url: logo('rituals.com'), website_url: 'https://rituals.com', industry: 'Beauty' },
  { id: 'charlotte', name: 'Charlotte Tilbury', logo_url: logo('charlottetilbury.com'), website_url: 'https://charlottetilbury.com', industry: 'Beauty' },
  { id: 'urbandecay', name: 'Urban Decay', logo_url: logo('urbandecay.com'), website_url: 'https://urbandecay.com', industry: 'Beauty' },
  { id: 'tartecosmetics', name: 'Tarte', logo_url: logo('tartecosmetics.com'), website_url: 'https://tartecosmetics.com', industry: 'Beauty' },
  { id: 'rarebeauty', name: 'Rare Beauty', logo_url: logo('rarebeauty.com'), website_url: 'https://rarebeauty.com', industry: 'Beauty' },
  { id: 'kyliecosmetics', name: 'Kylie Cosmetics', logo_url: logo('kyliecosmetics.com'), website_url: 'https://kyliecosmetics.com', industry: 'Beauty' },
  { id: 'theordinary', name: 'The Ordinary', logo_url: logo('theordinary.com'), website_url: 'https://theordinary.com', industry: 'Skincare' },
  { id: 'cerave', name: 'CeraVe', logo_url: logo('cerave.com'), website_url: 'https://cerave.com', industry: 'Skincare' },
  { id: 'olaplex', name: 'Olaplex', logo_url: logo('olaplex.com'), website_url: 'https://olaplex.com', industry: 'Haircare' },
  
  // Tech
  { id: 'apple', name: 'Apple', logo_url: logo('apple.com'), website_url: 'https://apple.com', industry: 'Tech' },
  { id: 'samsung', name: 'Samsung', logo_url: logo('samsung.com'), website_url: 'https://samsung.com', industry: 'Tech' },
  { id: 'sony', name: 'Sony', logo_url: logo('sony.com'), website_url: 'https://sony.com', industry: 'Tech' },
  { id: 'bose', name: 'Bose', logo_url: logo('bose.com'), website_url: 'https://bose.com', industry: 'Tech' },
  { id: 'beats', name: 'Beats', logo_url: logo('beatsbydre.com'), website_url: 'https://beatsbydre.com', industry: 'Tech' },
  { id: 'jbl', name: 'JBL', logo_url: logo('jbl.com'), website_url: 'https://jbl.com', industry: 'Tech' },
  { id: 'dyson', name: 'Dyson', logo_url: logo('dyson.com'), website_url: 'https://dyson.com', industry: 'Tech' },
  { id: 'gopro', name: 'GoPro', logo_url: logo('gopro.com'), website_url: 'https://gopro.com', industry: 'Tech' },
  { id: 'logitech', name: 'Logitech', logo_url: logo('logitech.com'), website_url: 'https://logitech.com', industry: 'Tech' },
  { id: 'razer', name: 'Razer', logo_url: logo('razer.com'), website_url: 'https://razer.com', industry: 'Gaming' },
  { id: 'steelseries', name: 'SteelSeries', logo_url: logo('steelseries.com'), website_url: 'https://steelseries.com', industry: 'Gaming' },
  { id: 'playstation', name: 'PlayStation', logo_url: logo('playstation.com'), website_url: 'https://playstation.com', industry: 'Gaming' },
  { id: 'nintendo', name: 'Nintendo', logo_url: logo('nintendo.com'), website_url: 'https://nintendo.com', industry: 'Gaming' },
  { id: 'xbox', name: 'Xbox', logo_url: logo('xbox.com'), website_url: 'https://xbox.com', industry: 'Gaming' },
  { id: 'oculus', name: 'Meta Quest', logo_url: logo('meta.com'), website_url: 'https://meta.com/quest', industry: 'Gaming' },
  { id: 'dji', name: 'DJI', logo_url: logo('dji.com'), website_url: 'https://dji.com', industry: 'Tech' },
  
  // Home & Living
  { id: 'ikea', name: 'IKEA', logo_url: logo('ikea.com'), website_url: 'https://ikea.com', industry: 'Home' },
  { id: 'westwing', name: 'Westwing', logo_url: logo('westwing.de'), website_url: 'https://westwing.de', industry: 'Home' },
  { id: 'wayfair', name: 'Wayfair', logo_url: logo('wayfair.com'), website_url: 'https://wayfair.com', industry: 'Home' },
  { id: 'cb2', name: 'CB2', logo_url: logo('cb2.com'), website_url: 'https://cb2.com', industry: 'Home' },
  { id: 'westelmn', name: 'West Elm', logo_url: logo('westelm.com'), website_url: 'https://westelm.com', industry: 'Home' },
  
  // Outdoor & Sports
  { id: 'thenorthface', name: 'The North Face', logo_url: logo('thenorthface.com'), website_url: 'https://thenorthface.com', industry: 'Outdoor' },
  { id: 'patagonia', name: 'Patagonia', logo_url: logo('patagonia.com'), website_url: 'https://patagonia.com', industry: 'Outdoor' },
  { id: 'columbia', name: 'Columbia', logo_url: logo('columbia.com'), website_url: 'https://columbia.com', industry: 'Outdoor' },
  { id: 'salomon', name: 'Salomon', logo_url: logo('salomon.com'), website_url: 'https://salomon.com', industry: 'Outdoor' },
  { id: 'arcteryx', name: "Arc'teryx", logo_url: logo('arcteryx.com'), website_url: 'https://arcteryx.com', industry: 'Outdoor' },
  { id: 'fjallraven', name: 'Fjällräven', logo_url: logo('fjallraven.com'), website_url: 'https://fjallraven.com', industry: 'Outdoor' },
  { id: 'hoka', name: 'HOKA', logo_url: logo('hoka.com'), website_url: 'https://hoka.com', industry: 'Sportswear' },
  { id: 'on', name: 'On Running', logo_url: logo('on-running.com'), website_url: 'https://on-running.com', industry: 'Sportswear' },
  
  // Food & Beverages
  { id: 'redbull', name: 'Red Bull', logo_url: logo('redbull.com'), website_url: 'https://redbull.com', industry: 'Beverages' },
  { id: 'monster', name: 'Monster Energy', logo_url: logo('monsterenergy.com'), website_url: 'https://monsterenergy.com', industry: 'Beverages' },
  { id: 'cocacola', name: 'Coca-Cola', logo_url: logo('coca-cola.com'), website_url: 'https://coca-cola.com', industry: 'Beverages' },
  { id: 'pepsi', name: 'Pepsi', logo_url: logo('pepsi.com'), website_url: 'https://pepsi.com', industry: 'Beverages' },
  { id: 'starbucks', name: 'Starbucks', logo_url: logo('starbucks.com'), website_url: 'https://starbucks.com', industry: 'Beverages' },
  { id: 'nespresso', name: 'Nespresso', logo_url: logo('nespresso.com'), website_url: 'https://nespresso.com', industry: 'Beverages' },
  { id: 'mcdonalds', name: "McDonald's", logo_url: logo('mcdonalds.com'), website_url: 'https://mcdonalds.com', industry: 'Food' },
  { id: 'burgerking', name: 'Burger King', logo_url: logo('burgerking.com'), website_url: 'https://burgerking.com', industry: 'Food' },
  { id: 'chipotle', name: 'Chipotle', logo_url: logo('chipotle.com'), website_url: 'https://chipotle.com', industry: 'Food' },
  
  // Watches & Jewelry
  { id: 'rolex', name: 'Rolex', logo_url: logo('rolex.com'), website_url: 'https://rolex.com', industry: 'Watches' },
  { id: 'omega', name: 'Omega', logo_url: logo('omegawatches.com'), website_url: 'https://omegawatches.com', industry: 'Watches' },
  { id: 'cartier', name: 'Cartier', logo_url: logo('cartier.com'), website_url: 'https://cartier.com', industry: 'Jewelry' },
  { id: 'tiffany', name: 'Tiffany & Co.', logo_url: logo('tiffany.com'), website_url: 'https://tiffany.com', industry: 'Jewelry' },
  { id: 'pandora', name: 'Pandora', logo_url: logo('pandora.net'), website_url: 'https://pandora.net', industry: 'Jewelry' },
  { id: 'swarovski', name: 'Swarovski', logo_url: logo('swarovski.com'), website_url: 'https://swarovski.com', industry: 'Jewelry' },
  { id: 'tagheuer', name: 'TAG Heuer', logo_url: logo('tagheuer.com'), website_url: 'https://tagheuer.com', industry: 'Watches' },
  { id: 'danielwellington', name: 'Daniel Wellington', logo_url: logo('danielwellington.com'), website_url: 'https://danielwellington.com', industry: 'Watches' },
  
  // Eyewear
  { id: 'rayban', name: 'Ray-Ban', logo_url: logo('ray-ban.com'), website_url: 'https://ray-ban.com', industry: 'Eyewear' },
  { id: 'oakley', name: 'Oakley', logo_url: logo('oakley.com'), website_url: 'https://oakley.com', industry: 'Eyewear' },
  { id: 'warbyparker', name: 'Warby Parker', logo_url: logo('warbyparker.com'), website_url: 'https://warbyparker.com', industry: 'Eyewear' },
  
  // Streetwear & Hype
  { id: 'supreme', name: 'Supreme', logo_url: logo('supremenewyork.com'), website_url: 'https://supremenewyork.com', industry: 'Streetwear' },
  { id: 'stussy', name: 'Stüssy', logo_url: logo('stussy.com'), website_url: 'https://stussy.com', industry: 'Streetwear' },
  { id: 'carhartt', name: 'Carhartt WIP', logo_url: logo('carhartt-wip.com'), website_url: 'https://carhartt-wip.com', industry: 'Streetwear' },
  { id: 'champion', name: 'Champion', logo_url: logo('champion.com'), website_url: 'https://champion.com', industry: 'Streetwear' },
  { id: 'fila', name: 'Fila', logo_url: logo('fila.com'), website_url: 'https://fila.com', industry: 'Streetwear' },
  { id: 'dickies', name: 'Dickies', logo_url: logo('dickies.com'), website_url: 'https://dickies.com', industry: 'Streetwear' },
  { id: 'offwhite', name: 'Off-White', logo_url: logo('off---white.com'), website_url: 'https://off---white.com', industry: 'Streetwear' },
  { id: 'palace', name: 'Palace', logo_url: logo('palaceskateboards.com'), website_url: 'https://palaceskateboards.com', industry: 'Streetwear' },
  { id: 'kith', name: 'Kith', logo_url: logo('kith.com'), website_url: 'https://kith.com', industry: 'Streetwear' },
  
  // Fitness & Wellness
  { id: 'gymshark', name: 'Gymshark', logo_url: logo('gymshark.com'), website_url: 'https://gymshark.com', industry: 'Fitness' },
  { id: 'lululemon', name: 'Lululemon', logo_url: logo('lululemon.com'), website_url: 'https://lululemon.com', industry: 'Fitness' },
  { id: 'myprotein', name: 'Myprotein', logo_url: logo('myprotein.com'), website_url: 'https://myprotein.com', industry: 'Fitness' },
  { id: 'alo', name: 'Alo Yoga', logo_url: logo('aloyoga.com'), website_url: 'https://aloyoga.com', industry: 'Fitness' },
  { id: 'whoop', name: 'WHOOP', logo_url: logo('whoop.com'), website_url: 'https://whoop.com', industry: 'Fitness' },
  { id: 'peloton', name: 'Peloton', logo_url: logo('onepeloton.com'), website_url: 'https://onepeloton.com', industry: 'Fitness' },
  
  // Automotive
  { id: 'bmw', name: 'BMW', logo_url: logo('bmw.com'), website_url: 'https://bmw.com', industry: 'Automotive' },
  { id: 'mercedes', name: 'Mercedes-Benz', logo_url: logo('mercedes-benz.com'), website_url: 'https://mercedes-benz.com', industry: 'Automotive' },
  { id: 'audi', name: 'Audi', logo_url: logo('audi.com'), website_url: 'https://audi.com', industry: 'Automotive' },
  { id: 'porsche', name: 'Porsche', logo_url: logo('porsche.com'), website_url: 'https://porsche.com', industry: 'Automotive' },
  { id: 'tesla', name: 'Tesla', logo_url: logo('tesla.com'), website_url: 'https://tesla.com', industry: 'Automotive' },
  { id: 'lamborghini', name: 'Lamborghini', logo_url: logo('lamborghini.com'), website_url: 'https://lamborghini.com', industry: 'Automotive' },
  { id: 'ferrari', name: 'Ferrari', logo_url: logo('ferrari.com'), website_url: 'https://ferrari.com', industry: 'Automotive' },
  
  // Entertainment & Media
  { id: 'netflix', name: 'Netflix', logo_url: logo('netflix.com'), website_url: 'https://netflix.com', industry: 'Entertainment' },
  { id: 'spotify', name: 'Spotify', logo_url: logo('spotify.com'), website_url: 'https://spotify.com', industry: 'Entertainment' },
  { id: 'disney', name: 'Disney+', logo_url: logo('disneyplus.com'), website_url: 'https://disneyplus.com', industry: 'Entertainment' },
  { id: 'youtube', name: 'YouTube', logo_url: logo('youtube.com'), website_url: 'https://youtube.com', industry: 'Entertainment' },
  { id: 'tiktok', name: 'TikTok', logo_url: logo('tiktok.com'), website_url: 'https://tiktok.com', industry: 'Entertainment' },
  { id: 'twitch', name: 'Twitch', logo_url: logo('twitch.tv'), website_url: 'https://twitch.tv', industry: 'Entertainment' },
];
