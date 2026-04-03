const mongoose = require('mongoose');
const Game     = require('./models/Game');
const Studio   = require('./models/Studio');
const Review   = require('./models/Review');
require('dotenv').config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([Game.deleteMany(), Studio.deleteMany(), Review.deleteMany()]);

  // --- Studios ---
  const studios = await Studio.insertMany([
    { name: 'Nintendo' },
    { name: 'CD Projekt Red' },
    { name: 'Rockstar Games' },
    { name: 'FromSoftware' },
    { name: 'Naughty Dog' },
    { name: 'Bethesda' },
    { name: 'Ubisoft' },
    { name: 'Valve' },
  ]);

  const [nintendo, cdpr, rockstar, fromsoftware, naughtydog, bethesda, ubisoft, valve] = studios;

  // --- Games ---
  const games = await Game.insertMany([
    // Nintendo
    { title: 'Breath of the Wild',      year: 2017, studio: nintendo._id,      genres: ['Adventure', 'RPG', 'Open World'],   imageUrl: 'https://upload.wikimedia.org/wikipedia/en/c/c6/The_Legend_of_Zelda_Breath_of_the_Wild.jpg' },
    { title: 'Tears of the Kingdom',    year: 2023, studio: nintendo._id,      genres: ['Adventure', 'RPG', 'Open World'],   imageUrl: 'https://upload.wikimedia.org/wikipedia/en/f/fb/The_Legend_of_Zelda_Tears_of_the_Kingdom_cover.jpg' },
    { title: 'Super Mario Odyssey',     year: 2017, studio: nintendo._id,      genres: ['Platformer', 'Adventure'],          imageUrl: 'https://upload.wikimedia.org/wikipedia/en/8/8d/Super_Mario_Odyssey.jpg' },
    { title: 'Mario Kart 8 Deluxe',     year: 2017, studio: nintendo._id,      genres: ['Racing', 'Multiplayer'],            imageUrl: 'https://static.wikia.nocookie.net/mariokart/images/9/9b/MK8_Deluxe_-_Box_NA.png/revision/latest?cb=20170704085016' },

    // CD Projekt Red
    { title: 'The Witcher 3',           year: 2015, studio: cdpr._id,          genres: ['RPG', 'Open World'],                imageUrl: 'https://upload.wikimedia.org/wikipedia/en/0/0c/Witcher_3_cover_art.jpg' },
    { title: 'Cyberpunk 2077',          year: 2020, studio: cdpr._id,          genres: ['RPG', 'Action', 'Open World'],      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/9/9f/Cyberpunk_2077_box_art.jpg' },

    // Rockstar Games
    { title: 'Red Dead Redemption 2',   year: 2018, studio: rockstar._id,      genres: ['Action', 'Adventure', 'Open World'],imageUrl: 'https://upload.wikimedia.org/wikipedia/en/4/44/Red_Dead_Redemption_II.jpg' },
    { title: 'GTA V',                   year: 2013, studio: rockstar._id,      genres: ['Action', 'Open World', 'Multiplayer'],imageUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a5/Grand_Theft_Auto_V.png' },

    // FromSoftware
    { title: 'Elden Ring',              year: 2022, studio: fromsoftware._id,  genres: ['RPG', 'Action', 'Open World'],      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/b/b9/Elden_Ring_Box_art.jpg' },
    { title: 'Dark Souls III',          year: 2016, studio: fromsoftware._id,  genres: ['RPG', 'Action'],                    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/b/bb/Dark_souls_3_cover_art.jpg' },
    { title: 'Sekiro',                  year: 2019, studio: fromsoftware._id,  genres: ['Action', 'Adventure'],              imageUrl: 'https://upload.wikimedia.org/wikipedia/en/6/6e/Sekiro_art.jpg' },
    { title: 'Bloodborne',              year: 2015, studio: fromsoftware._id,  genres: ['RPG', 'Action'],                    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/6/68/Bloodborne_Cover_Wallpaper.jpg' },

    // Naughty Dog
    { title: 'The Last of Us Part I',   year: 2022, studio: naughtydog._id,    genres: ['Action', 'Adventure', 'Survival'],  imageUrl: 'https://upload.wikimedia.org/wikipedia/en/8/86/The_Last_of_Us_Part_I_cover.jpg' },
    { title: 'The Last of Us Part II',  year: 2020, studio: naughtydog._id,    genres: ['Action', 'Adventure', 'Survival'],  imageUrl: 'https://images-cdn.ubuy.co.in/6512693724dfc14c8912c4be-the-last-of-us-part-ii-gaming-poster.jpg' },
    { title: 'Uncharted 4',             year: 2016, studio: naughtydog._id,    genres: ['Action', 'Adventure'],              imageUrl: 'https://upload.wikimedia.org/wikipedia/en/1/1a/Uncharted_4_box_artwork.jpg' },

    // Bethesda
    { title: 'Skyrim',                  year: 2011, studio: bethesda._id,      genres: ['RPG', 'Open World'],                imageUrl: 'https://upload.wikimedia.org/wikipedia/en/1/15/The_Elder_Scrolls_V_Skyrim_cover.png' },
    { title: 'Fallout 4',               year: 2015, studio: bethesda._id,      genres: ['RPG', 'Action', 'Open World'],      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/7/70/Fallout_4_cover_art.jpg' },

    // Ubisoft
    { title: 'Assassin\'s Creed Origins', year: 2017, studio: ubisoft._id,    genres: ['Action', 'Adventure', 'Open World'],imageUrl: 'https://upload.wikimedia.org/wikipedia/en/4/4a/Assassin%27s_Creed_Origins_Cover_Art.png' },
    { title: 'Far Cry 5',               year: 2018, studio: ubisoft._id,       genres: ['Action', 'Open World'],             imageUrl: 'https://pbs.twimg.com/media/DAmrLYiXsAA5xXP.jpg' },

    // Valve
    { title: 'Portal 2',                year: 2011, studio: valve._id,         genres: ['Puzzle', 'Adventure', 'Multiplayer'],imageUrl: 'https://upload.wikimedia.org/wikipedia/en/f/f9/Portal2cover.jpg' },
    { title: 'Half-Life: Alyx',         year: 2020, studio: valve._id,         genres: ['Action', 'VR'],                     imageUrl: 'https://upload.wikimedia.org/wikipedia/en/4/49/Half-Life_Alyx_Cover_Art.jpg' },
  ]);

  // Map games by title for easy reference
  const g = {};
  games.forEach(game => { g[game.title] = game; });

  // --- Reviews ---
  await Review.insertMany([
    // Breath of the Wild
    { rating: 10, comment: 'Absolute masterpiece, redefined open world games.',        game: g['Breath of the Wild']._id },
    { rating: 9,  comment: 'Stunning exploration, a bit light on story.',               game: g['Breath of the Wild']._id },
    { rating: 10, comment: 'Nothing like it. Every corner hides a surprise.',           game: g['Breath of the Wild']._id },

    // Tears of the Kingdom
    { rating: 10, comment: 'Even better than BotW. The sky islands are breathtaking.', game: g['Tears of the Kingdom']._id },
    { rating: 9,  comment: 'Ultrahand mechanic is genius, slightly repetitive shrines.',game: g['Tears of the Kingdom']._id },

    // Super Mario Odyssey
    { rating: 9,  comment: 'Pure joy from start to finish.',                            game: g['Super Mario Odyssey']._id },
    { rating: 10, comment: 'Best 3D Mario ever made.',                                  game: g['Super Mario Odyssey']._id },

    // The Witcher 3
    { rating: 10, comment: 'The gold standard of RPGs. Incredible writing.',            game: g['The Witcher 3']._id },
    { rating: 9,  comment: 'Huge world with great quests. Combat feels dated.',         game: g['The Witcher 3']._id },
    { rating: 10, comment: 'Blood and Wine DLC alone is worth the price.',              game: g['The Witcher 3']._id },

    // Cyberpunk 2077
    { rating: 8,  comment: 'Rough launch but 2.0 update transformed the game.',        game: g['Cyberpunk 2077']._id },
    { rating: 9,  comment: 'Incredible atmosphere and story, V is a great protagonist.',game: g['Cyberpunk 2077']._id },
    { rating: 6,  comment: 'Still buggy on my end, but the world design is stunning.',  game: g['Cyberpunk 2077']._id },

    // Red Dead Redemption 2
    { rating: 10, comment: 'The most immersive open world ever created.',               game: g['Red Dead Redemption 2']._id },
    { rating: 10, comment: 'Arthur Morgan is one of gaming\'s greatest characters.',   game: g['Red Dead Redemption 2']._id },
    { rating: 9,  comment: 'Slow paced but deeply rewarding.',                          game: g['Red Dead Redemption 2']._id },

    // Elden Ring
    { rating: 10, comment: 'FromSoftware at their absolute peak.',                      game: g['Elden Ring']._id },
    { rating: 9,  comment: 'Punishing but fair. The Lands Between is breathtaking.',   game: g['Elden Ring']._id },
    { rating: 8,  comment: 'Great game, late game bosses feel unbalanced.',             game: g['Elden Ring']._id },

    // Dark Souls III
    { rating: 9,  comment: 'Tight level design and brutal but satisfying combat.',     game: g['Dark Souls III']._id },
    { rating: 8,  comment: 'Great finale to the trilogy.',                              game: g['Dark Souls III']._id },

    // Sekiro
    { rating: 10, comment: 'The parry system is perfection once it clicks.',            game: g['Sekiro']._id },
    { rating: 7,  comment: 'Too hard for me personally, but undeniably brilliant.',     game: g['Sekiro']._id },

    // The Last of Us
    { rating: 10, comment: 'Best narrative experience in gaming.',                      game: g['The Last of Us Part I']._id },
    { rating: 10, comment: 'Joel and Ellie\'s story is unforgettable.',                game: g['The Last of Us Part I']._id },

    // The Last of Us Part II
    { rating: 10, comment: 'Brave, brutal, and emotionally devastating.',               game: g['The Last of Us Part II']._id },
    { rating: 7,  comment: 'Great gameplay, divisive story choices.',                   game: g['The Last of Us Part II']._id },

    // Skyrim
    { rating: 9,  comment: 'Still holds up after all these years.',                     game: g['Skyrim']._id },
    { rating: 8,  comment: 'Massive world, thin RPG mechanics but hugely fun.',         game: g['Skyrim']._id },

    // Portal 2
    { rating: 10, comment: 'Funniest and cleverest game ever made.',                    game: g['Portal 2']._id },
    { rating: 10, comment: 'Co-op mode alone makes it worth every penny.',              game: g['Portal 2']._id },

    // Half-Life: Alyx
    { rating: 10, comment: 'The killer app for VR. Absolutely stunning.',               game: g['Half-Life: Alyx']._id },
    { rating: 9,  comment: 'Needs a VR headset but nothing else comes close.',          game: g['Half-Life: Alyx']._id },
  ]);

  console.log(`✅ Seeded:`);
  console.log(`   ${studios.length} studios`);
  console.log(`   ${games.length} games`);
  console.log(`   35 reviews`);
  mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  mongoose.disconnect();
});
