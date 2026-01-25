// Curated list of well-known brands for aspirational display
// These are NOT registered brands - they serve as placeholders for future outreach
// Using brand logos from various reliable CDN sources

export interface AspirationalBrand {
  id: string;
  name: string;
  logo_url: string;
  website_url: string;
  industry: string;
}

export const aspirationalBrands: AspirationalBrand[] = [
  // Fashion & Sportswear
  { id: 'nike', name: 'Nike', logo_url: 'https://cdn.worldvectorlogo.com/logos/nike-4.svg', website_url: 'https://nike.com', industry: 'Sportswear' },
  { id: 'adidas', name: 'Adidas', logo_url: 'https://cdn.worldvectorlogo.com/logos/adidas-9.svg', website_url: 'https://adidas.com', industry: 'Sportswear' },
  { id: 'puma', name: 'Puma', logo_url: 'https://cdn.worldvectorlogo.com/logos/puma-logo.svg', website_url: 'https://puma.com', industry: 'Sportswear' },
  { id: 'reebok', name: 'Reebok', logo_url: 'https://cdn.worldvectorlogo.com/logos/reebok-2019.svg', website_url: 'https://reebok.com', industry: 'Sportswear' },
  { id: 'underarmour', name: 'Under Armour', logo_url: 'https://cdn.worldvectorlogo.com/logos/under-armour-2.svg', website_url: 'https://underarmour.com', industry: 'Sportswear' },
  { id: 'newbalance', name: 'New Balance', logo_url: 'https://cdn.worldvectorlogo.com/logos/new-balance-2.svg', website_url: 'https://newbalance.com', industry: 'Sportswear' },
  { id: 'asics', name: 'ASICS', logo_url: 'https://cdn.worldvectorlogo.com/logos/asics.svg', website_url: 'https://asics.com', industry: 'Sportswear' },
  { id: 'converse', name: 'Converse', logo_url: 'https://cdn.worldvectorlogo.com/logos/converse-4.svg', website_url: 'https://converse.com', industry: 'Sportswear' },
  { id: 'vans', name: 'Vans', logo_url: 'https://cdn.worldvectorlogo.com/logos/vans-4.svg', website_url: 'https://vans.com', industry: 'Streetwear' },
  
  // Fast Fashion
  { id: 'zara', name: 'Zara', logo_url: 'https://cdn.worldvectorlogo.com/logos/zara-2019.svg', website_url: 'https://zara.com', industry: 'Fashion' },
  { id: 'hm', name: 'H&M', logo_url: 'https://cdn.worldvectorlogo.com/logos/h-m-1.svg', website_url: 'https://hm.com', industry: 'Fashion' },
  { id: 'asos', name: 'ASOS', logo_url: 'https://cdn.worldvectorlogo.com/logos/asos.svg', website_url: 'https://asos.com', industry: 'Fashion' },
  { id: 'mango', name: 'Mango', logo_url: 'https://cdn.worldvectorlogo.com/logos/mango-1.svg', website_url: 'https://mango.com', industry: 'Fashion' },
  { id: 'uniqlo', name: 'Uniqlo', logo_url: 'https://cdn.worldvectorlogo.com/logos/uniqlo-1.svg', website_url: 'https://uniqlo.com', industry: 'Fashion' },
  { id: 'primark', name: 'Primark', logo_url: 'https://cdn.worldvectorlogo.com/logos/primark.svg', website_url: 'https://primark.com', industry: 'Fashion' },
  { id: 'pull-bear', name: 'Pull&Bear', logo_url: 'https://cdn.worldvectorlogo.com/logos/pull-bear.svg', website_url: 'https://pullandbear.com', industry: 'Fashion' },
  { id: 'bershka', name: 'Bershka', logo_url: 'https://cdn.worldvectorlogo.com/logos/bershka-1.svg', website_url: 'https://bershka.com', industry: 'Fashion' },
  { id: 'aboutyou', name: 'About You', logo_url: 'https://cdn.worldvectorlogo.com/logos/about-you-1.svg', website_url: 'https://aboutyou.de', industry: 'Fashion' },
  { id: 'zalando', name: 'Zalando', logo_url: 'https://cdn.worldvectorlogo.com/logos/zalando.svg', website_url: 'https://zalando.de', industry: 'Fashion' },
  { id: 'shein', name: 'SHEIN', logo_url: 'https://cdn.worldvectorlogo.com/logos/shein-1.svg', website_url: 'https://shein.com', industry: 'Fashion' },
  
  // Luxury Fashion
  { id: 'gucci', name: 'Gucci', logo_url: 'https://cdn.worldvectorlogo.com/logos/gucci-4.svg', website_url: 'https://gucci.com', industry: 'Luxury' },
  { id: 'louisvuitton', name: 'Louis Vuitton', logo_url: 'https://cdn.worldvectorlogo.com/logos/louis-vuitton-2.svg', website_url: 'https://louisvuitton.com', industry: 'Luxury' },
  { id: 'prada', name: 'Prada', logo_url: 'https://cdn.worldvectorlogo.com/logos/prada-3.svg', website_url: 'https://prada.com', industry: 'Luxury' },
  { id: 'chanel', name: 'Chanel', logo_url: 'https://cdn.worldvectorlogo.com/logos/chanel-1.svg', website_url: 'https://chanel.com', industry: 'Luxury' },
  { id: 'dior', name: 'Dior', logo_url: 'https://cdn.worldvectorlogo.com/logos/dior-1.svg', website_url: 'https://dior.com', industry: 'Luxury' },
  { id: 'balenciaga', name: 'Balenciaga', logo_url: 'https://cdn.worldvectorlogo.com/logos/balenciaga.svg', website_url: 'https://balenciaga.com', industry: 'Luxury' },
  { id: 'burberry', name: 'Burberry', logo_url: 'https://cdn.worldvectorlogo.com/logos/burberry-2.svg', website_url: 'https://burberry.com', industry: 'Luxury' },
  { id: 'versace', name: 'Versace', logo_url: 'https://cdn.worldvectorlogo.com/logos/versace-3.svg', website_url: 'https://versace.com', industry: 'Luxury' },
  { id: 'armani', name: 'Armani', logo_url: 'https://cdn.worldvectorlogo.com/logos/armani-exchange.svg', website_url: 'https://armani.com', industry: 'Luxury' },
  { id: 'fendi', name: 'Fendi', logo_url: 'https://cdn.worldvectorlogo.com/logos/fendi.svg', website_url: 'https://fendi.com', industry: 'Luxury' },
  { id: 'hermes', name: 'Hermès', logo_url: 'https://cdn.worldvectorlogo.com/logos/hermes-9.svg', website_url: 'https://hermes.com', industry: 'Luxury' },
  { id: 'moncler', name: 'Moncler', logo_url: 'https://cdn.worldvectorlogo.com/logos/moncler-1.svg', website_url: 'https://moncler.com', industry: 'Luxury' },
  
  // Beauty & Cosmetics
  { id: 'sephora', name: 'Sephora', logo_url: 'https://cdn.worldvectorlogo.com/logos/sephora.svg', website_url: 'https://sephora.com', industry: 'Beauty' },
  { id: 'douglas', name: 'Douglas', logo_url: 'https://cdn.worldvectorlogo.com/logos/douglas-1.svg', website_url: 'https://douglas.de', industry: 'Beauty' },
  { id: 'loreal', name: "L'Oréal", logo_url: 'https://cdn.worldvectorlogo.com/logos/loreal-paris.svg', website_url: 'https://loreal.com', industry: 'Beauty' },
  { id: 'mac', name: 'MAC Cosmetics', logo_url: 'https://cdn.worldvectorlogo.com/logos/mac-cosmetics.svg', website_url: 'https://maccosmetics.com', industry: 'Beauty' },
  { id: 'maybelline', name: 'Maybelline', logo_url: 'https://cdn.worldvectorlogo.com/logos/maybelline-new-york.svg', website_url: 'https://maybelline.com', industry: 'Beauty' },
  { id: 'nyx', name: 'NYX', logo_url: 'https://cdn.worldvectorlogo.com/logos/nyx-cosmetics.svg', website_url: 'https://nyxcosmetics.com', industry: 'Beauty' },
  { id: 'benefit', name: 'Benefit', logo_url: 'https://cdn.worldvectorlogo.com/logos/benefit-cosmetics.svg', website_url: 'https://benefitcosmetics.com', industry: 'Beauty' },
  { id: 'fenty', name: 'Fenty Beauty', logo_url: 'https://cdn.worldvectorlogo.com/logos/fenty-beauty.svg', website_url: 'https://fentybeauty.com', industry: 'Beauty' },
  { id: 'glossier', name: 'Glossier', logo_url: 'https://cdn.worldvectorlogo.com/logos/glossier.svg', website_url: 'https://glossier.com', industry: 'Beauty' },
  { id: 'clinique', name: 'Clinique', logo_url: 'https://cdn.worldvectorlogo.com/logos/clinique.svg', website_url: 'https://clinique.com', industry: 'Skincare' },
  { id: 'esteelauder', name: 'Estée Lauder', logo_url: 'https://cdn.worldvectorlogo.com/logos/estee-lauder-1.svg', website_url: 'https://esteelauder.com', industry: 'Beauty' },
  { id: 'lush', name: 'Lush', logo_url: 'https://cdn.worldvectorlogo.com/logos/lush-1.svg', website_url: 'https://lush.com', industry: 'Beauty' },
  { id: 'thebodyshop', name: 'The Body Shop', logo_url: 'https://cdn.worldvectorlogo.com/logos/the-body-shop-2.svg', website_url: 'https://thebodyshop.com', industry: 'Beauty' },
  { id: 'rituals', name: 'Rituals', logo_url: 'https://cdn.worldvectorlogo.com/logos/rituals-1.svg', website_url: 'https://rituals.com', industry: 'Beauty' },
  
  // Tech
  { id: 'apple', name: 'Apple', logo_url: 'https://cdn.worldvectorlogo.com/logos/apple-11.svg', website_url: 'https://apple.com', industry: 'Tech' },
  { id: 'samsung', name: 'Samsung', logo_url: 'https://cdn.worldvectorlogo.com/logos/samsung-4.svg', website_url: 'https://samsung.com', industry: 'Tech' },
  { id: 'sony', name: 'Sony', logo_url: 'https://cdn.worldvectorlogo.com/logos/sony.svg', website_url: 'https://sony.com', industry: 'Tech' },
  { id: 'bose', name: 'Bose', logo_url: 'https://cdn.worldvectorlogo.com/logos/bose-corporation.svg', website_url: 'https://bose.com', industry: 'Tech' },
  { id: 'beats', name: 'Beats', logo_url: 'https://cdn.worldvectorlogo.com/logos/beats-electronics.svg', website_url: 'https://beatsbydre.com', industry: 'Tech' },
  { id: 'jbl', name: 'JBL', logo_url: 'https://cdn.worldvectorlogo.com/logos/jbl-2.svg', website_url: 'https://jbl.com', industry: 'Tech' },
  { id: 'dyson', name: 'Dyson', logo_url: 'https://cdn.worldvectorlogo.com/logos/dyson-1.svg', website_url: 'https://dyson.com', industry: 'Tech' },
  { id: 'gopro', name: 'GoPro', logo_url: 'https://cdn.worldvectorlogo.com/logos/gopro-logo.svg', website_url: 'https://gopro.com', industry: 'Tech' },
  { id: 'logitech', name: 'Logitech', logo_url: 'https://cdn.worldvectorlogo.com/logos/logitech-2.svg', website_url: 'https://logitech.com', industry: 'Tech' },
  { id: 'razer', name: 'Razer', logo_url: 'https://cdn.worldvectorlogo.com/logos/razer-1.svg', website_url: 'https://razer.com', industry: 'Gaming' },
  { id: 'steelseries', name: 'SteelSeries', logo_url: 'https://cdn.worldvectorlogo.com/logos/steelseries-1.svg', website_url: 'https://steelseries.com', industry: 'Gaming' },
  { id: 'playstation', name: 'PlayStation', logo_url: 'https://cdn.worldvectorlogo.com/logos/playstation-2.svg', website_url: 'https://playstation.com', industry: 'Gaming' },
  { id: 'nintendo', name: 'Nintendo', logo_url: 'https://cdn.worldvectorlogo.com/logos/nintendo-2.svg', website_url: 'https://nintendo.com', industry: 'Gaming' },
  { id: 'xbox', name: 'Xbox', logo_url: 'https://cdn.worldvectorlogo.com/logos/xbox-9.svg', website_url: 'https://xbox.com', industry: 'Gaming' },
  
  // Home & Living
  { id: 'ikea', name: 'IKEA', logo_url: 'https://cdn.worldvectorlogo.com/logos/ikea.svg', website_url: 'https://ikea.com', industry: 'Home' },
  { id: 'westwing', name: 'Westwing', logo_url: 'https://cdn.worldvectorlogo.com/logos/westwing-1.svg', website_url: 'https://westwing.de', industry: 'Home' },
  
  // Outdoor & Sports
  { id: 'thenorthface', name: 'The North Face', logo_url: 'https://cdn.worldvectorlogo.com/logos/the-north-face-1.svg', website_url: 'https://thenorthface.com', industry: 'Outdoor' },
  { id: 'patagonia', name: 'Patagonia', logo_url: 'https://cdn.worldvectorlogo.com/logos/patagonia-1.svg', website_url: 'https://patagonia.com', industry: 'Outdoor' },
  { id: 'columbia', name: 'Columbia', logo_url: 'https://cdn.worldvectorlogo.com/logos/columbia-3.svg', website_url: 'https://columbia.com', industry: 'Outdoor' },
  { id: 'salomon', name: 'Salomon', logo_url: 'https://cdn.worldvectorlogo.com/logos/salomon-3.svg', website_url: 'https://salomon.com', industry: 'Outdoor' },
  { id: 'mammut', name: 'Mammut', logo_url: 'https://cdn.worldvectorlogo.com/logos/mammut.svg', website_url: 'https://mammut.com', industry: 'Outdoor' },
  { id: 'fjallraven', name: 'Fjällräven', logo_url: 'https://cdn.worldvectorlogo.com/logos/fjallraven-1.svg', website_url: 'https://fjallraven.com', industry: 'Outdoor' },
  
  // Food & Beverages
  { id: 'redbull', name: 'Red Bull', logo_url: 'https://cdn.worldvectorlogo.com/logos/red-bull.svg', website_url: 'https://redbull.com', industry: 'Beverages' },
  { id: 'monster', name: 'Monster Energy', logo_url: 'https://cdn.worldvectorlogo.com/logos/monster-energy.svg', website_url: 'https://monsterenergy.com', industry: 'Beverages' },
  { id: 'cocacola', name: 'Coca-Cola', logo_url: 'https://cdn.worldvectorlogo.com/logos/coca-cola-4.svg', website_url: 'https://coca-cola.com', industry: 'Beverages' },
  { id: 'pepsi', name: 'Pepsi', logo_url: 'https://cdn.worldvectorlogo.com/logos/pepsi-5.svg', website_url: 'https://pepsi.com', industry: 'Beverages' },
  { id: 'starbucks', name: 'Starbucks', logo_url: 'https://cdn.worldvectorlogo.com/logos/starbucks-coffee.svg', website_url: 'https://starbucks.com', industry: 'Beverages' },
  { id: 'nespresso', name: 'Nespresso', logo_url: 'https://cdn.worldvectorlogo.com/logos/nespresso-2.svg', website_url: 'https://nespresso.com', industry: 'Beverages' },
  { id: 'mcdonalds', name: "McDonald's", logo_url: 'https://cdn.worldvectorlogo.com/logos/mcdonald-s-15.svg', website_url: 'https://mcdonalds.com', industry: 'Food' },
  { id: 'burgerking', name: 'Burger King', logo_url: 'https://cdn.worldvectorlogo.com/logos/burger-king-4.svg', website_url: 'https://burgerking.com', industry: 'Food' },
  { id: 'kfc', name: 'KFC', logo_url: 'https://cdn.worldvectorlogo.com/logos/kfc-7.svg', website_url: 'https://kfc.com', industry: 'Food' },
  { id: 'subway', name: 'Subway', logo_url: 'https://cdn.worldvectorlogo.com/logos/subway-2018.svg', website_url: 'https://subway.com', industry: 'Food' },
  
  // Watches & Jewelry
  { id: 'rolex', name: 'Rolex', logo_url: 'https://cdn.worldvectorlogo.com/logos/rolex-1.svg', website_url: 'https://rolex.com', industry: 'Watches' },
  { id: 'omega', name: 'Omega', logo_url: 'https://cdn.worldvectorlogo.com/logos/omega-3.svg', website_url: 'https://omegawatches.com', industry: 'Watches' },
  { id: 'cartier', name: 'Cartier', logo_url: 'https://cdn.worldvectorlogo.com/logos/cartier.svg', website_url: 'https://cartier.com', industry: 'Jewelry' },
  { id: 'tiffany', name: 'Tiffany & Co.', logo_url: 'https://cdn.worldvectorlogo.com/logos/tiffany-co.svg', website_url: 'https://tiffany.com', industry: 'Jewelry' },
  { id: 'pandora', name: 'Pandora', logo_url: 'https://cdn.worldvectorlogo.com/logos/pandora-3.svg', website_url: 'https://pandora.net', industry: 'Jewelry' },
  { id: 'swarovski', name: 'Swarovski', logo_url: 'https://cdn.worldvectorlogo.com/logos/swarovski-ag.svg', website_url: 'https://swarovski.com', industry: 'Jewelry' },
  { id: 'tagheuer', name: 'TAG Heuer', logo_url: 'https://cdn.worldvectorlogo.com/logos/tag-heuer-1.svg', website_url: 'https://tagheuer.com', industry: 'Watches' },
  
  // Eyewear
  { id: 'rayban', name: 'Ray-Ban', logo_url: 'https://cdn.worldvectorlogo.com/logos/ray-ban.svg', website_url: 'https://ray-ban.com', industry: 'Eyewear' },
  { id: 'oakley', name: 'Oakley', logo_url: 'https://cdn.worldvectorlogo.com/logos/oakley-9.svg', website_url: 'https://oakley.com', industry: 'Eyewear' },
  
  // Streetwear & Hype
  { id: 'supreme', name: 'Supreme', logo_url: 'https://cdn.worldvectorlogo.com/logos/supreme-2.svg', website_url: 'https://supremenewyork.com', industry: 'Streetwear' },
  { id: 'stussy', name: 'Stüssy', logo_url: 'https://cdn.worldvectorlogo.com/logos/stussy.svg', website_url: 'https://stussy.com', industry: 'Streetwear' },
  { id: 'carhartt', name: 'Carhartt WIP', logo_url: 'https://cdn.worldvectorlogo.com/logos/carhartt-1.svg', website_url: 'https://carhartt-wip.com', industry: 'Streetwear' },
  { id: 'champion', name: 'Champion', logo_url: 'https://cdn.worldvectorlogo.com/logos/champion-3.svg', website_url: 'https://champion.com', industry: 'Streetwear' },
  { id: 'fila', name: 'Fila', logo_url: 'https://cdn.worldvectorlogo.com/logos/fila-5.svg', website_url: 'https://fila.com', industry: 'Streetwear' },
  { id: 'dickies', name: 'Dickies', logo_url: 'https://cdn.worldvectorlogo.com/logos/dickies.svg', website_url: 'https://dickies.com', industry: 'Streetwear' },
  
  // Fitness & Wellness
  { id: 'gymshark', name: 'Gymshark', logo_url: 'https://cdn.worldvectorlogo.com/logos/gymshark.svg', website_url: 'https://gymshark.com', industry: 'Fitness' },
  { id: 'lululemon', name: 'Lululemon', logo_url: 'https://cdn.worldvectorlogo.com/logos/lululemon-athletica.svg', website_url: 'https://lululemon.com', industry: 'Fitness' },
  { id: 'myprotein', name: 'Myprotein', logo_url: 'https://cdn.worldvectorlogo.com/logos/myprotein.svg', website_url: 'https://myprotein.com', industry: 'Fitness' },
  
  // Automotive
  { id: 'bmw', name: 'BMW', logo_url: 'https://cdn.worldvectorlogo.com/logos/bmw-2.svg', website_url: 'https://bmw.com', industry: 'Automotive' },
  { id: 'mercedes', name: 'Mercedes-Benz', logo_url: 'https://cdn.worldvectorlogo.com/logos/mercedes-benz-9.svg', website_url: 'https://mercedes-benz.com', industry: 'Automotive' },
  { id: 'audi', name: 'Audi', logo_url: 'https://cdn.worldvectorlogo.com/logos/audi-13.svg', website_url: 'https://audi.com', industry: 'Automotive' },
  { id: 'porsche', name: 'Porsche', logo_url: 'https://cdn.worldvectorlogo.com/logos/porsche.svg', website_url: 'https://porsche.com', industry: 'Automotive' },
  { id: 'tesla', name: 'Tesla', logo_url: 'https://cdn.worldvectorlogo.com/logos/tesla-motors.svg', website_url: 'https://tesla.com', industry: 'Automotive' },
  { id: 'lamborghini', name: 'Lamborghini', logo_url: 'https://cdn.worldvectorlogo.com/logos/lamborghini-10.svg', website_url: 'https://lamborghini.com', industry: 'Automotive' },
  { id: 'ferrari', name: 'Ferrari', logo_url: 'https://cdn.worldvectorlogo.com/logos/ferrari-2.svg', website_url: 'https://ferrari.com', industry: 'Automotive' },
  
  // Airlines & Travel
  { id: 'emirates', name: 'Emirates', logo_url: 'https://cdn.worldvectorlogo.com/logos/emirates-1.svg', website_url: 'https://emirates.com', industry: 'Travel' },
  { id: 'lufthansa', name: 'Lufthansa', logo_url: 'https://cdn.worldvectorlogo.com/logos/lufthansa-3.svg', website_url: 'https://lufthansa.com', industry: 'Travel' },
  
  // Entertainment & Media
  { id: 'netflix', name: 'Netflix', logo_url: 'https://cdn.worldvectorlogo.com/logos/netflix-3.svg', website_url: 'https://netflix.com', industry: 'Entertainment' },
  { id: 'spotify', name: 'Spotify', logo_url: 'https://cdn.worldvectorlogo.com/logos/spotify-2.svg', website_url: 'https://spotify.com', industry: 'Entertainment' },
  { id: 'disney', name: 'Disney', logo_url: 'https://cdn.worldvectorlogo.com/logos/disney-2.svg', website_url: 'https://disney.com', industry: 'Entertainment' },
  { id: 'youtube', name: 'YouTube', logo_url: 'https://cdn.worldvectorlogo.com/logos/youtube-icon-5.svg', website_url: 'https://youtube.com', industry: 'Entertainment' },
  { id: 'tiktok', name: 'TikTok', logo_url: 'https://cdn.worldvectorlogo.com/logos/tiktok-icon-2.svg', website_url: 'https://tiktok.com', industry: 'Entertainment' },
  { id: 'instagram', name: 'Instagram', logo_url: 'https://cdn.worldvectorlogo.com/logos/instagram-2-1.svg', website_url: 'https://instagram.com', industry: 'Social Media' },
];
