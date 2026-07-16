const DAILY_WISHES = {
  uk: [
    'Легкого старту.',
    'Спокійного темпу.',
    'Крок за кроком.',
    'Сили на день.',
    'Фокус і спокій.',
    'Сьогодні все вийде.',
    'Менше метушні.',
    'Більше ясності.',
    'Тримай свій ритм.',
    'Довіряй собі.',
    'Роби просте добре.',
    'Нехай день складається.',
    'Малий крок теж рух.',
    'Бережи свій спокій.',
    'Сміливо починай.',
    'Дій без зайвого шуму.',
    'Сили вистачить.',
    'Сьогодні ти впораєшся.',
    'Один крок далі.',
    'Світла думка на день.',
    'Спокій і точність.',
    'Нехай буде легко.',
    'Рухайся рівно.',
    'Добрий темп на день.',
    'Впевнено вперед.',
    'Нехай все складається.',
    'Тримай фокус.',
    'Сьогодні твій день.',
    'Більше сили, менше сумнівів.',
    'Почни і продовжуй.',
    'Легкості у справах.',
  ],
  en: [
    'Easy start.',
    'Steady pace.',
    'One step at a time.',
    'Strength for today.',
    'Focus and calm.',
    'Today will work out.',
    'Less rush.',
    'More clarity.',
    'Keep your rhythm.',
    'Trust yourself.',
    'Do the simple well.',
    'Let the day flow.',
    'A small step still counts.',
    'Protect your calm.',
    'Start with courage.',
    'Move without extra noise.',
    'You have enough strength.',
    'You will handle today.',
    'One step further.',
    'A bright thought for today.',
    'Calm and precision.',
    'May it feel light.',
    'Move steadily.',
    'A good pace today.',
    'Forward with confidence.',
    'Let it come together.',
    'Hold your focus.',
    'Today is yours.',
    'More strength, less doubt.',
    'Start and keep going.',
    'Ease in your work.',
  ],
} as const

const HEADER_TIME_ZONE = 'Europe/Prague'

function getDayOfYearInPrague(date: Date) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: HEADER_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const parts = formatter.formatToParts(date)
  const year = Number(parts.find((part) => part.type === 'year')?.value)
  const month = Number(parts.find((part) => part.type === 'month')?.value)
  const day = Number(parts.find((part) => part.type === 'day')?.value)

  return Math.floor((Date.UTC(year, month - 1, day) - Date.UTC(year, 0, 0)) / 86_400_000)
}

export function getDailyWish(locale: string, date = new Date()) {
  const wishes = locale === 'uk' ? DAILY_WISHES.uk : DAILY_WISHES.en
  const dayOfYear = getDayOfYearInPrague(date)

  return wishes[(dayOfYear - 1) % wishes.length]
}
