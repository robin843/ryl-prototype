// Curated list of well-known brands for aspirational display
// These are NOT registered brands - they serve as placeholders for future outreach

export interface AspirationalBrand {
  id: string;
  name: string;
  logo_url: string;
  website_url: string;
  industry: string;
}

export const aspirationalBrands: AspirationalBrand[] = [
  // Fashion & Sportswear
  { id: 'nike', name: 'Nike', logo_url: 'https://logo.clearbit.com/nike.com', website_url: 'https://nike.com', industry: 'Sportswear' },
  { id: 'adidas', name: 'Adidas', logo_url: 'https://logo.clearbit.com/adidas.com', website_url: 'https://adidas.com', industry: 'Sportswear' },
  { id: 'puma', name: 'Puma', logo_url: 'https://logo.clearbit.com/puma.com', website_url: 'https://puma.com', industry: 'Sportswear' },
  { id: 'reebok', name: 'Reebok', logo_url: 'https://logo.clearbit.com/reebok.com', website_url: 'https://reebok.com', industry: 'Sportswear' },
  { id: 'underarmour', name: 'Under Armour', logo_url: 'https://logo.clearbit.com/underarmour.com', website_url: 'https://underarmour.com', industry: 'Sportswear' },
  { id: 'newbalance', name: 'New Balance', logo_url: 'https://logo.clearbit.com/newbalance.com', website_url: 'https://newbalance.com', industry: 'Sportswear' },
  { id: 'asics', name: 'ASICS', logo_url: 'https://logo.clearbit.com/asics.com', website_url: 'https://asics.com', industry: 'Sportswear' },
  { id: 'converse', name: 'Converse', logo_url: 'https://logo.clearbit.com/converse.com', website_url: 'https://converse.com', industry: 'Sportswear' },
  { id: 'vans', name: 'Vans', logo_url: 'https://logo.clearbit.com/vans.com', website_url: 'https://vans.com', industry: 'Streetwear' },
  
  // Fast Fashion
  { id: 'zara', name: 'Zara', logo_url: 'https://logo.clearbit.com/zara.com', website_url: 'https://zara.com', industry: 'Fashion' },
  { id: 'hm', name: 'H&M', logo_url: 'https://logo.clearbit.com/hm.com', website_url: 'https://hm.com', industry: 'Fashion' },
  { id: 'asos', name: 'ASOS', logo_url: 'https://logo.clearbit.com/asos.com', website_url: 'https://asos.com', industry: 'Fashion' },
  { id: 'mango', name: 'Mango', logo_url: 'https://logo.clearbit.com/mango.com', website_url: 'https://mango.com', industry: 'Fashion' },
  { id: 'uniqlo', name: 'Uniqlo', logo_url: 'https://logo.clearbit.com/uniqlo.com', website_url: 'https://uniqlo.com', industry: 'Fashion' },
  { id: 'primark', name: 'Primark', logo_url: 'https://logo.clearbit.com/primark.com', website_url: 'https://primark.com', industry: 'Fashion' },
  { id: 'pull-bear', name: 'Pull&Bear', logo_url: 'https://logo.clearbit.com/pullandbear.com', website_url: 'https://pullandbear.com', industry: 'Fashion' },
  { id: 'bershka', name: 'Bershka', logo_url: 'https://logo.clearbit.com/bershka.com', website_url: 'https://bershka.com', industry: 'Fashion' },
  { id: 'stradivarius', name: 'Stradivarius', logo_url: 'https://logo.clearbit.com/stradivarius.com', website_url: 'https://stradivarius.com', industry: 'Fashion' },
  { id: 'reserved', name: 'Reserved', logo_url: 'https://logo.clearbit.com/reserved.com', website_url: 'https://reserved.com', industry: 'Fashion' },
  { id: 'aboutyou', name: 'About You', logo_url: 'https://logo.clearbit.com/aboutyou.de', website_url: 'https://aboutyou.de', industry: 'Fashion' },
  { id: 'zalando', name: 'Zalando', logo_url: 'https://logo.clearbit.com/zalando.de', website_url: 'https://zalando.de', industry: 'Fashion' },
  { id: 'boohoo', name: 'Boohoo', logo_url: 'https://logo.clearbit.com/boohoo.com', website_url: 'https://boohoo.com', industry: 'Fashion' },
  { id: 'prettylittlething', name: 'PrettyLittleThing', logo_url: 'https://logo.clearbit.com/prettylittlething.com', website_url: 'https://prettylittlething.com', industry: 'Fashion' },
  { id: 'shein', name: 'SHEIN', logo_url: 'https://logo.clearbit.com/shein.com', website_url: 'https://shein.com', industry: 'Fashion' },
  { id: 'na-kd', name: 'NA-KD', logo_url: 'https://logo.clearbit.com/na-kd.com', website_url: 'https://na-kd.com', industry: 'Fashion' },
  
  // Luxury Fashion
  { id: 'gucci', name: 'Gucci', logo_url: 'https://logo.clearbit.com/gucci.com', website_url: 'https://gucci.com', industry: 'Luxury' },
  { id: 'louisvuitton', name: 'Louis Vuitton', logo_url: 'https://logo.clearbit.com/louisvuitton.com', website_url: 'https://louisvuitton.com', industry: 'Luxury' },
  { id: 'prada', name: 'Prada', logo_url: 'https://logo.clearbit.com/prada.com', website_url: 'https://prada.com', industry: 'Luxury' },
  { id: 'chanel', name: 'Chanel', logo_url: 'https://logo.clearbit.com/chanel.com', website_url: 'https://chanel.com', industry: 'Luxury' },
  { id: 'dior', name: 'Dior', logo_url: 'https://logo.clearbit.com/dior.com', website_url: 'https://dior.com', industry: 'Luxury' },
  { id: 'balenciaga', name: 'Balenciaga', logo_url: 'https://logo.clearbit.com/balenciaga.com', website_url: 'https://balenciaga.com', industry: 'Luxury' },
  { id: 'burberry', name: 'Burberry', logo_url: 'https://logo.clearbit.com/burberry.com', website_url: 'https://burberry.com', industry: 'Luxury' },
  { id: 'versace', name: 'Versace', logo_url: 'https://logo.clearbit.com/versace.com', website_url: 'https://versace.com', industry: 'Luxury' },
  { id: 'armani', name: 'Armani', logo_url: 'https://logo.clearbit.com/armani.com', website_url: 'https://armani.com', industry: 'Luxury' },
  { id: 'fendi', name: 'Fendi', logo_url: 'https://logo.clearbit.com/fendi.com', website_url: 'https://fendi.com', industry: 'Luxury' },
  { id: 'hermes', name: 'Hermès', logo_url: 'https://logo.clearbit.com/hermes.com', website_url: 'https://hermes.com', industry: 'Luxury' },
  { id: 'bottegaveneta', name: 'Bottega Veneta', logo_url: 'https://logo.clearbit.com/bottegaveneta.com', website_url: 'https://bottegaveneta.com', industry: 'Luxury' },
  { id: 'moncler', name: 'Moncler', logo_url: 'https://logo.clearbit.com/moncler.com', website_url: 'https://moncler.com', industry: 'Luxury' },
  
  // Beauty & Cosmetics
  { id: 'sephora', name: 'Sephora', logo_url: 'https://logo.clearbit.com/sephora.com', website_url: 'https://sephora.com', industry: 'Beauty' },
  { id: 'douglas', name: 'Douglas', logo_url: 'https://logo.clearbit.com/douglas.de', website_url: 'https://douglas.de', industry: 'Beauty' },
  { id: 'loreal', name: "L'Oréal", logo_url: 'https://logo.clearbit.com/loreal.com', website_url: 'https://loreal.com', industry: 'Beauty' },
  { id: 'mac', name: 'MAC Cosmetics', logo_url: 'https://logo.clearbit.com/maccosmetics.com', website_url: 'https://maccosmetics.com', industry: 'Beauty' },
  { id: 'maybelline', name: 'Maybelline', logo_url: 'https://logo.clearbit.com/maybelline.com', website_url: 'https://maybelline.com', industry: 'Beauty' },
  { id: 'nyx', name: 'NYX', logo_url: 'https://logo.clearbit.com/nyxcosmetics.com', website_url: 'https://nyxcosmetics.com', industry: 'Beauty' },
  { id: 'urbandecay', name: 'Urban Decay', logo_url: 'https://logo.clearbit.com/urbandecay.com', website_url: 'https://urbandecay.com', industry: 'Beauty' },
  { id: 'benefit', name: 'Benefit', logo_url: 'https://logo.clearbit.com/benefitcosmetics.com', website_url: 'https://benefitcosmetics.com', industry: 'Beauty' },
  { id: 'charlotte-tilbury', name: 'Charlotte Tilbury', logo_url: 'https://logo.clearbit.com/charlottetilbury.com', website_url: 'https://charlottetilbury.com', industry: 'Beauty' },
  { id: 'fenty', name: 'Fenty Beauty', logo_url: 'https://logo.clearbit.com/fentybeauty.com', website_url: 'https://fentybeauty.com', industry: 'Beauty' },
  { id: 'rare-beauty', name: 'Rare Beauty', logo_url: 'https://logo.clearbit.com/rarebeauty.com', website_url: 'https://rarebeauty.com', industry: 'Beauty' },
  { id: 'glossier', name: 'Glossier', logo_url: 'https://logo.clearbit.com/glossier.com', website_url: 'https://glossier.com', industry: 'Beauty' },
  { id: 'theordinary', name: 'The Ordinary', logo_url: 'https://logo.clearbit.com/theordinary.com', website_url: 'https://theordinary.com', industry: 'Skincare' },
  { id: 'cerave', name: 'CeraVe', logo_url: 'https://logo.clearbit.com/cerave.com', website_url: 'https://cerave.com', industry: 'Skincare' },
  { id: 'larocheposay', name: 'La Roche-Posay', logo_url: 'https://logo.clearbit.com/laroche-posay.com', website_url: 'https://laroche-posay.com', industry: 'Skincare' },
  { id: 'clinique', name: 'Clinique', logo_url: 'https://logo.clearbit.com/clinique.com', website_url: 'https://clinique.com', industry: 'Skincare' },
  { id: 'esteelauder', name: 'Estée Lauder', logo_url: 'https://logo.clearbit.com/esteelauder.com', website_url: 'https://esteelauder.com', industry: 'Beauty' },
  { id: 'lush', name: 'Lush', logo_url: 'https://logo.clearbit.com/lush.com', website_url: 'https://lush.com', industry: 'Beauty' },
  { id: 'thebodyshop', name: 'The Body Shop', logo_url: 'https://logo.clearbit.com/thebodyshop.com', website_url: 'https://thebodyshop.com', industry: 'Beauty' },
  { id: 'rituals', name: 'Rituals', logo_url: 'https://logo.clearbit.com/rituals.com', website_url: 'https://rituals.com', industry: 'Beauty' },
  
  // Tech
  { id: 'apple', name: 'Apple', logo_url: 'https://logo.clearbit.com/apple.com', website_url: 'https://apple.com', industry: 'Tech' },
  { id: 'samsung', name: 'Samsung', logo_url: 'https://logo.clearbit.com/samsung.com', website_url: 'https://samsung.com', industry: 'Tech' },
  { id: 'sony', name: 'Sony', logo_url: 'https://logo.clearbit.com/sony.com', website_url: 'https://sony.com', industry: 'Tech' },
  { id: 'bose', name: 'Bose', logo_url: 'https://logo.clearbit.com/bose.com', website_url: 'https://bose.com', industry: 'Tech' },
  { id: 'beats', name: 'Beats', logo_url: 'https://logo.clearbit.com/beatsbydre.com', website_url: 'https://beatsbydre.com', industry: 'Tech' },
  { id: 'jbl', name: 'JBL', logo_url: 'https://logo.clearbit.com/jbl.com', website_url: 'https://jbl.com', industry: 'Tech' },
  { id: 'dyson', name: 'Dyson', logo_url: 'https://logo.clearbit.com/dyson.com', website_url: 'https://dyson.com', industry: 'Tech' },
  { id: 'gopro', name: 'GoPro', logo_url: 'https://logo.clearbit.com/gopro.com', website_url: 'https://gopro.com', industry: 'Tech' },
  { id: 'logitech', name: 'Logitech', logo_url: 'https://logo.clearbit.com/logitech.com', website_url: 'https://logitech.com', industry: 'Tech' },
  { id: 'razer', name: 'Razer', logo_url: 'https://logo.clearbit.com/razer.com', website_url: 'https://razer.com', industry: 'Gaming' },
  { id: 'steelseries', name: 'SteelSeries', logo_url: 'https://logo.clearbit.com/steelseries.com', website_url: 'https://steelseries.com', industry: 'Gaming' },
  { id: 'playstation', name: 'PlayStation', logo_url: 'https://logo.clearbit.com/playstation.com', website_url: 'https://playstation.com', industry: 'Gaming' },
  { id: 'nintendo', name: 'Nintendo', logo_url: 'https://logo.clearbit.com/nintendo.com', website_url: 'https://nintendo.com', industry: 'Gaming' },
  
  // Home & Living
  { id: 'ikea', name: 'IKEA', logo_url: 'https://logo.clearbit.com/ikea.com', website_url: 'https://ikea.com', industry: 'Home' },
  { id: 'westwing', name: 'Westwing', logo_url: 'https://logo.clearbit.com/westwing.de', website_url: 'https://westwing.de', industry: 'Home' },
  { id: 'home24', name: 'home24', logo_url: 'https://logo.clearbit.com/home24.de', website_url: 'https://home24.de', industry: 'Home' },
  { id: 'depot', name: 'Depot', logo_url: 'https://logo.clearbit.com/depot-online.de', website_url: 'https://depot-online.de', industry: 'Home' },
  { id: 'urbanara', name: 'Urbanara', logo_url: 'https://logo.clearbit.com/urbanara.de', website_url: 'https://urbanara.de', industry: 'Home' },
  
  // Outdoor & Sports
  { id: 'thenorthface', name: 'The North Face', logo_url: 'https://logo.clearbit.com/thenorthface.com', website_url: 'https://thenorthface.com', industry: 'Outdoor' },
  { id: 'patagonia', name: 'Patagonia', logo_url: 'https://logo.clearbit.com/patagonia.com', website_url: 'https://patagonia.com', industry: 'Outdoor' },
  { id: 'columbia', name: 'Columbia', logo_url: 'https://logo.clearbit.com/columbia.com', website_url: 'https://columbia.com', industry: 'Outdoor' },
  { id: 'arcteryx', name: "Arc'teryx", logo_url: 'https://logo.clearbit.com/arcteryx.com', website_url: 'https://arcteryx.com', industry: 'Outdoor' },
  { id: 'salomon', name: 'Salomon', logo_url: 'https://logo.clearbit.com/salomon.com', website_url: 'https://salomon.com', industry: 'Outdoor' },
  { id: 'mammut', name: 'Mammut', logo_url: 'https://logo.clearbit.com/mammut.com', website_url: 'https://mammut.com', industry: 'Outdoor' },
  { id: 'fjallraven', name: 'Fjällräven', logo_url: 'https://logo.clearbit.com/fjallraven.com', website_url: 'https://fjallraven.com', industry: 'Outdoor' },
  
  // Food & Beverages
  { id: 'redbull', name: 'Red Bull', logo_url: 'https://logo.clearbit.com/redbull.com', website_url: 'https://redbull.com', industry: 'Beverages' },
  { id: 'monster', name: 'Monster Energy', logo_url: 'https://logo.clearbit.com/monsterenergy.com', website_url: 'https://monsterenergy.com', industry: 'Beverages' },
  { id: 'cocacola', name: 'Coca-Cola', logo_url: 'https://logo.clearbit.com/coca-cola.com', website_url: 'https://coca-cola.com', industry: 'Beverages' },
  { id: 'pepsi', name: 'Pepsi', logo_url: 'https://logo.clearbit.com/pepsi.com', website_url: 'https://pepsi.com', industry: 'Beverages' },
  { id: 'starbucks', name: 'Starbucks', logo_url: 'https://logo.clearbit.com/starbucks.com', website_url: 'https://starbucks.com', industry: 'Beverages' },
  { id: 'nespresso', name: 'Nespresso', logo_url: 'https://logo.clearbit.com/nespresso.com', website_url: 'https://nespresso.com', industry: 'Beverages' },
  
  // Watches & Jewelry
  { id: 'rolex', name: 'Rolex', logo_url: 'https://logo.clearbit.com/rolex.com', website_url: 'https://rolex.com', industry: 'Watches' },
  { id: 'omega', name: 'Omega', logo_url: 'https://logo.clearbit.com/omegawatches.com', website_url: 'https://omegawatches.com', industry: 'Watches' },
  { id: 'cartier', name: 'Cartier', logo_url: 'https://logo.clearbit.com/cartier.com', website_url: 'https://cartier.com', industry: 'Jewelry' },
  { id: 'tiffany', name: 'Tiffany & Co.', logo_url: 'https://logo.clearbit.com/tiffany.com', website_url: 'https://tiffany.com', industry: 'Jewelry' },
  { id: 'pandora', name: 'Pandora', logo_url: 'https://logo.clearbit.com/pandora.net', website_url: 'https://pandora.net', industry: 'Jewelry' },
  { id: 'swarovski', name: 'Swarovski', logo_url: 'https://logo.clearbit.com/swarovski.com', website_url: 'https://swarovski.com', industry: 'Jewelry' },
  { id: 'daniel-wellington', name: 'Daniel Wellington', logo_url: 'https://logo.clearbit.com/danielwellington.com', website_url: 'https://danielwellington.com', industry: 'Watches' },
  
  // Eyewear
  { id: 'rayban', name: 'Ray-Ban', logo_url: 'https://logo.clearbit.com/ray-ban.com', website_url: 'https://ray-ban.com', industry: 'Eyewear' },
  { id: 'oakley', name: 'Oakley', logo_url: 'https://logo.clearbit.com/oakley.com', website_url: 'https://oakley.com', industry: 'Eyewear' },
  
  // Streetwear & Hype
  { id: 'supreme', name: 'Supreme', logo_url: 'https://logo.clearbit.com/supremenewyork.com', website_url: 'https://supremenewyork.com', industry: 'Streetwear' },
  { id: 'offwhite', name: 'Off-White', logo_url: 'https://logo.clearbit.com/off---white.com', website_url: 'https://off---white.com', industry: 'Streetwear' },
  { id: 'stussy', name: 'Stüssy', logo_url: 'https://logo.clearbit.com/stussy.com', website_url: 'https://stussy.com', industry: 'Streetwear' },
  { id: 'palace', name: 'Palace', logo_url: 'https://logo.clearbit.com/palaceskateboards.com', website_url: 'https://palaceskateboards.com', industry: 'Streetwear' },
  { id: 'carhartt', name: 'Carhartt WIP', logo_url: 'https://logo.clearbit.com/carhartt-wip.com', website_url: 'https://carhartt-wip.com', industry: 'Streetwear' },
  
  // Fitness & Wellness
  { id: 'gymshark', name: 'Gymshark', logo_url: 'https://logo.clearbit.com/gymshark.com', website_url: 'https://gymshark.com', industry: 'Fitness' },
  { id: 'lululemon', name: 'Lululemon', logo_url: 'https://logo.clearbit.com/lululemon.com', website_url: 'https://lululemon.com', industry: 'Fitness' },
  { id: 'alo', name: 'Alo Yoga', logo_url: 'https://logo.clearbit.com/aloyoga.com', website_url: 'https://aloyoga.com', industry: 'Fitness' },
  { id: 'myprotein', name: 'Myprotein', logo_url: 'https://logo.clearbit.com/myprotein.com', website_url: 'https://myprotein.com', industry: 'Fitness' },
  { id: 'foodspring', name: 'Foodspring', logo_url: 'https://logo.clearbit.com/foodspring.de', website_url: 'https://foodspring.de', industry: 'Fitness' },
];
