/**
 * Curated UK flood history — major events from 1947 to present.
 * Each event has real coordinates, affected area radius, and severity.
 * Used by the timeline visualisation engine.
 */

export interface HistoricFloodEvent {
  id: string;
  year: number;
  month: number;
  name: string;
  description: string;
  cause: string;
  severity: 1 | 2 | 3; // 1=catastrophic, 2=major, 3=significant
  /** Approximate centre of the flood event [lng, lat] */
  center: [number, number];
  /** Approximate radius in km of affected area */
  radiusKm: number;
  /** Additional affected locations for multi-point rendering */
  affected: Array<{ name: string; coords: [number, number] }>;
  /** Notable facts */
  impact: string;
}

/**
 * Curated timeline of major UK flood events.
 * Sources: EA records, Met Office, Wikipedia, UK gov reports.
 */
export const UK_FLOOD_HISTORY: HistoricFloodEvent[] = [
  {
    id: 'flood-1947-thames',
    year: 1947,
    month: 3,
    name: 'Great Flood of 1947',
    description: 'Rapid snowmelt after one of the coldest winters on record caused catastrophic flooding across England and Wales.',
    cause: 'Snowmelt + rainfall',
    severity: 1,
    center: [-1.26, 51.75],
    radiusKm: 80,
    affected: [
      { name: 'Oxford', coords: [-1.26, 51.75] },
      { name: 'Nottingham', coords: [-1.15, 52.95] },
      { name: 'Fen District', coords: [0.12, 52.58] },
      { name: 'Bedford', coords: [-0.46, 52.14] },
      { name: 'Shrewsbury', coords: [-2.75, 52.71] },
    ],
    impact: '100,000 properties flooded. Giant ice blocks swept through towns. One of the worst natural disasters in modern UK history.',
  },
  {
    id: 'flood-1953-east-coast',
    year: 1953,
    month: 1,
    name: 'North Sea Flood 1953',
    description: 'A devastating storm surge combined with spring tides breached sea defences along the entire east coast of England.',
    cause: 'Storm surge + spring tide',
    severity: 1,
    center: [1.15, 52.47],
    radiusKm: 100,
    affected: [
      { name: 'Canvey Island', coords: [0.58, 51.52] },
      { name: 'Jaywick', coords: [1.10, 51.78] },
      { name: 'King\'s Lynn', coords: [0.40, 52.75] },
      { name: 'Mablethorpe', coords: [0.26, 53.34] },
      { name: 'Spurn Head', coords: [0.11, 53.58] },
      { name: 'Felixstowe', coords: [1.35, 51.96] },
    ],
    impact: '307 people killed, 30,000+ evacuated. Led directly to construction of the Thames Barrier. Worst peacetime disaster of the 20th century.',
  },
  {
    id: 'flood-1968-se-england',
    year: 1968,
    month: 9,
    name: 'Southeast England Floods 1968',
    description: 'Intense rainfall across Kent and Surrey caused severe flash flooding and river overflow.',
    cause: 'Extreme rainfall',
    severity: 2,
    center: [0.52, 51.27],
    radiusKm: 35,
    affected: [
      { name: 'Maidstone', coords: [0.52, 51.27] },
      { name: 'Tonbridge', coords: [0.28, 51.19] },
      { name: 'Guildford', coords: [-0.57, 51.24] },
    ],
    impact: '5 deaths, thousands of properties flooded. River Medway burst its banks dramatically.',
  },
  {
    id: 'flood-1998-easter',
    year: 1998,
    month: 4,
    name: 'Easter 1998 Floods',
    description: 'Prolonged heavy rainfall over the Easter weekend led to widespread flooding across the English Midlands.',
    cause: 'Sustained heavy rainfall',
    severity: 2,
    center: [-2.24, 52.19],
    radiusKm: 60,
    affected: [
      { name: 'Northampton', coords: [-0.90, 52.24] },
      { name: 'Leamington Spa', coords: [-1.54, 52.29] },
      { name: 'Banbury', coords: [-1.34, 52.06] },
      { name: 'Kidderminster', coords: [-2.24, 52.39] },
      { name: 'Worcester', coords: [-2.22, 52.19] },
    ],
    impact: '5 deaths, 4,500 properties flooded. Easter holiday travel chaos. £500m+ damage.',
  },
  {
    id: 'flood-2000-autumn',
    year: 2000,
    month: 10,
    name: 'Autumn 2000 Floods',
    description: 'The wettest autumn since records began. Rivers across England reached record levels over months of continuous rain.',
    cause: 'Prolonged Atlantic storms',
    severity: 1,
    center: [-1.54, 53.80],
    radiusKm: 100,
    affected: [
      { name: 'York', coords: [-1.08, 53.96] },
      { name: 'Lewes', coords: [0.01, 50.87] },
      { name: 'Shrewsbury', coords: [-2.75, 52.71] },
      { name: 'Bewdley', coords: [-2.32, 52.38] },
      { name: 'Uckfield', coords: [0.10, 50.97] },
      { name: 'Selby', coords: [-1.07, 53.78] },
    ],
    impact: '10,000+ properties flooded over 3 months. Railway lines and motorways submerged. £1bn damage.',
  },
  {
    id: 'flood-2004-boscastle',
    year: 2004,
    month: 8,
    name: 'Boscastle Flash Flood',
    description: 'A devastating flash flood turned the picturesque Cornish village into a raging torrent. 75mm of rain fell in 2 hours.',
    cause: 'Localised extreme rainfall',
    severity: 2,
    center: [-4.69, 50.69],
    radiusKm: 10,
    affected: [
      { name: 'Boscastle', coords: [-4.69, 50.69] },
      { name: 'Crackington Haven', coords: [-4.65, 50.74] },
    ],
    impact: 'Miraculous zero deaths. 100+ cars swept to sea. Village centre completely destroyed. Largest peacetime rescue in UK history (7 helicopters).',
  },
  {
    id: 'flood-2005-carlisle',
    year: 2005,
    month: 1,
    name: 'Carlisle Floods 2005',
    description: 'Record-breaking rainfall of 200mm in 36 hours caused all three rivers in Carlisle to burst their banks simultaneously.',
    cause: 'Record rainfall',
    severity: 2,
    center: [-2.93, 54.89],
    radiusKm: 20,
    affected: [
      { name: 'Carlisle', coords: [-2.93, 54.89] },
      { name: 'Warwick Bridge', coords: [-2.83, 54.87] },
      { name: 'Brampton', coords: [-2.73, 54.94] },
    ],
    impact: '3 deaths, 1,844 properties flooded. Water 2.5m deep in places. United Utilities water treatment works destroyed — 60,000 without clean water.',
  },
  {
    id: 'flood-2007-summer',
    year: 2007,
    month: 7,
    name: 'Summer 2007 Floods',
    description: 'The wettest summer since records began in 1766. June and July saw extraordinary rainfall across England and Wales.',
    cause: 'Persistent jet stream anomaly',
    severity: 1,
    center: [-2.08, 51.90],
    radiusKm: 120,
    affected: [
      { name: 'Tewkesbury', coords: [-2.16, 51.99] },
      { name: 'Sheffield', coords: [-1.47, 53.38] },
      { name: 'Doncaster', coords: [-1.13, 53.52] },
      { name: 'Hull', coords: [-0.34, 53.74] },
      { name: 'Gloucester', coords: [-2.24, 51.86] },
      { name: 'Oxford', coords: [-1.26, 51.75] },
      { name: 'Evesham', coords: [-1.95, 52.09] },
    ],
    impact: '13 deaths, 55,000+ properties flooded. Iconic images of Tewkesbury Abbey surrounded by water. 350,000 without water in Gloucestershire. £3.2bn total cost.',
  },
  {
    id: 'flood-2009-cumbria',
    year: 2009,
    month: 11,
    name: 'Cumbria Floods 2009',
    description: '316mm of rainfall recorded in 24 hours at Seathwaite — a UK record. Every major river in Cumbria flooded.',
    cause: 'Record 24hr rainfall',
    severity: 2,
    center: [-3.13, 54.58],
    radiusKm: 40,
    affected: [
      { name: 'Cockermouth', coords: [-3.36, 54.66] },
      { name: 'Workington', coords: [-3.54, 54.64] },
      { name: 'Keswick', coords: [-3.13, 54.60] },
      { name: 'Seathwaite', coords: [-3.16, 54.49] },
    ],
    impact: '1 death (PC Bill Barker swept from collapsed bridge). 1,300 properties flooded. Multiple bridges destroyed. Workington split in two.',
  },
  {
    id: 'flood-2012-england',
    year: 2012,
    month: 11,
    name: 'November 2012 Floods',
    description: 'Persistent rainfall across England and Wales caused widespread flooding. Wettest year since records began in 1910.',
    cause: 'Sustained rainfall — wettest year on record',
    severity: 2,
    center: [-2.47, 51.38],
    radiusKm: 80,
    affected: [
      { name: 'St Asaph', coords: [-3.44, 53.26] },
      { name: 'Malmesbury', coords: [-2.10, 51.58] },
      { name: 'Kempsey', coords: [-2.22, 52.14] },
      { name: 'Upton upon Severn', coords: [-2.22, 52.06] },
    ],
    impact: '2 deaths, 8,000 properties flooded over 2 months. A1 and M5 motorways closed. Devon railway line washed away.',
  },
  {
    id: 'flood-2013-surgeseas',
    year: 2013,
    month: 12,
    name: 'Xaver Storm Surge 2013',
    description: 'Storm Xaver drove the biggest North Sea storm surge since 1953. Sea levels higher than 1953 in some locations.',
    cause: 'Storm surge',
    severity: 2,
    center: [0.41, 53.57],
    radiusKm: 100,
    affected: [
      { name: 'Boston', coords: [-0.02, 52.98] },
      { name: 'Great Yarmouth', coords: [1.73, 52.61] },
      { name: 'Whitby', coords: [-0.62, 54.49] },
      { name: 'Scarborough', coords: [-0.40, 54.28] },
      { name: 'Immingham', coords: [-0.22, 53.61] },
    ],
    impact: '2 deaths, 2,800 properties flooded. Thames Barrier closed for longest continuous period. Sea levels exceeded 1953 in places but modern defences held.',
  },
  {
    id: 'flood-2014-somerset',
    year: 2014,
    month: 1,
    name: 'Somerset Levels Floods 2014',
    description: 'The Somerset Levels were underwater for months. Villages became islands. The wettest January in 250 years.',
    cause: 'Prolonged exceptional rainfall',
    severity: 2,
    center: [-2.93, 51.10],
    radiusKm: 30,
    affected: [
      { name: 'Muchelney', coords: [-2.83, 51.00] },
      { name: 'Moorland', coords: [-2.95, 51.10] },
      { name: 'Burrowbridge', coords: [-2.96, 51.05] },
      { name: 'Bridgwater', coords: [-3.00, 51.13] },
    ],
    impact: '600+ properties flooded. Moorland village evacuated for 2 months. 65 sq km of farmland submerged. £147m economic damage.',
  },
  {
    id: 'flood-2015-desmond',
    year: 2015,
    month: 12,
    name: 'Storm Desmond',
    description: 'Storm Desmond broke the UK all-time 24hr rainfall record with 341mm at Honister Pass. Devastating floods across Cumbria and Lancashire.',
    cause: 'Atmospheric river + Storm Desmond',
    severity: 1,
    center: [-2.93, 54.66],
    radiusKm: 60,
    affected: [
      { name: 'Carlisle', coords: [-2.93, 54.89] },
      { name: 'Kendal', coords: [-2.74, 54.33] },
      { name: 'Lancaster', coords: [-2.80, 54.05] },
      { name: 'Appleby', coords: [-2.49, 54.58] },
      { name: 'Cockermouth', coords: [-3.36, 54.66] },
      { name: 'Keswick', coords: [-3.13, 54.60] },
    ],
    impact: '2 deaths, 16,000 properties flooded. 61,000 homes without power. Lancaster city centre without power for 4 days. UK 24hr rainfall record: 341mm.',
  },
  {
    id: 'flood-2015-eva',
    year: 2015,
    month: 12,
    name: 'Storm Eva — Boxing Day Floods',
    description: 'Just weeks after Desmond, Storm Eva hit Yorkshire on Boxing Day. Record river levels across Leeds and the Calder Valley.',
    cause: 'Storm Eva',
    severity: 1,
    center: [-1.78, 53.79],
    radiusKm: 50,
    affected: [
      { name: 'Leeds', coords: [-1.55, 53.80] },
      { name: 'York', coords: [-1.08, 53.96] },
      { name: 'Hebden Bridge', coords: [-2.01, 53.74] },
      { name: 'Todmorden', coords: [-2.10, 53.71] },
      { name: 'Elland', coords: [-1.84, 53.69] },
      { name: 'Tadcaster', coords: [-1.26, 53.88] },
    ],
    impact: 'River Aire reached highest level ever. Tadcaster bridge collapsed. Combined Dec 2015 total: £1.6bn damage, wettest month ever recorded in UK.',
  },
  {
    id: 'flood-2019-derwent',
    year: 2019,
    month: 11,
    name: 'Derwent Valley Floods 2019',
    description: 'A month\'s rainfall fell in one day across Derbyshire. Whaley Bridge dam threatened to collapse.',
    cause: 'Extreme rainfall + infrastructure failure',
    severity: 2,
    center: [-1.98, 53.33],
    radiusKm: 25,
    affected: [
      { name: 'Whaley Bridge', coords: [-1.98, 53.33] },
      { name: 'Matlock', coords: [-1.55, 53.14] },
      { name: 'Belper', coords: [-1.48, 53.02] },
    ],
    impact: '1,500 residents evacuated from Whaley Bridge for 6 days due to dam collapse risk. RAF Chinook deployed to fill the breach.',
  },
  {
    id: 'flood-2020-dennis',
    year: 2020,
    month: 2,
    name: 'Storm Dennis',
    description: 'Called a "bomb cyclone" — Dennis brought record rainfall across Wales and central England just a week after Storm Ciara.',
    cause: 'Bomb cyclone + saturated ground',
    severity: 1,
    center: [-3.18, 51.48],
    radiusKm: 80,
    affected: [
      { name: 'Pontypridd', coords: [-3.34, 51.60] },
      { name: 'Nantgarw', coords: [-3.26, 51.55] },
      { name: 'Tenbury Wells', coords: [-2.60, 52.31] },
      { name: 'Hereford', coords: [-2.72, 52.06] },
      { name: 'Bewdley', coords: [-2.32, 52.38] },
      { name: 'Shrewsbury', coords: [-2.75, 52.71] },
      { name: 'Ironbridge', coords: [-2.49, 52.63] },
    ],
    impact: '3 deaths, 3,300+ properties flooded. River Wye reached highest level in 200 years. 5 severe flood warnings (danger to life). £333m insurance claims.',
  },
  {
    id: 'flood-2023-babet',
    year: 2023,
    month: 10,
    name: 'Storm Babet',
    description: 'An unusually intense autumn storm brought persistent torrential rain to eastern Scotland and northeast England.',
    cause: 'Slow-moving storm system',
    severity: 2,
    center: [-2.97, 56.46],
    radiusKm: 60,
    affected: [
      { name: 'Brechin', coords: [-2.66, 56.73] },
      { name: 'Arbroath', coords: [-2.59, 56.56] },
      { name: 'Catcliffe', coords: [-1.38, 53.38] },
      { name: 'Retford', coords: [-0.95, 53.32] },
    ],
    impact: '7 deaths across UK and Ireland. River South Esk reached record level. 2,000+ properties flooded. £500m+ damage estimate.',
  },
  {
    id: 'flood-2024-henryk',
    year: 2024,
    month: 1,
    name: 'Storm Henk 2024',
    description: 'Heavy rainfall from Storm Henk fell on already saturated ground, causing widespread flooding across the Midlands and southern England.',
    cause: 'Storm Henk + saturated catchments',
    severity: 2,
    center: [-1.47, 52.41],
    radiusKm: 60,
    affected: [
      { name: 'Nottingham', coords: [-1.15, 52.95] },
      { name: 'Warwick', coords: [-1.59, 52.28] },
      { name: 'Northampton', coords: [-0.90, 52.24] },
      { name: 'Bedford', coords: [-0.46, 52.14] },
      { name: 'Tewkesbury', coords: [-2.16, 51.99] },
    ],
    impact: '2,000+ properties flooded. Over 300 flood warnings active simultaneously. River Soar and Avon at record levels.',
  },
];

export function getEventsForYear(year: number): HistoricFloodEvent[] {
  return UK_FLOOD_HISTORY.filter((e) => e.year === year);
}

export function getEventsUpToYear(year: number): HistoricFloodEvent[] {
  return UK_FLOOD_HISTORY.filter((e) => e.year <= year);
}

export function getUniqueYears(): number[] {
  return [...new Set(UK_FLOOD_HISTORY.map((e) => e.year))].sort((a, b) => a - b);
}
