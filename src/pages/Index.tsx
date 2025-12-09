import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { toast } from '@/hooks/use-toast';
import { requestNotificationPermission, onMessageListener } from '@/lib/firebase';

type NewsCategory = 'all' | 'politics' | 'economy' | 'tech' | 'sport' | 'culture';

interface NewsItem {
  id: number;
  title: string;
  description: string;
  category: NewsCategory;
  date: string;
  isImportant?: boolean;
}

interface ZodiacSign {
  name: string;
  icon: string;
  date: string;
  prediction: string;
}

interface WeatherDay {
  day: string;
  temp: number;
  condition: string;
  icon: string;
}

const mockNews: NewsItem[] = [
  {
    id: 1,
    title: 'Центробанк снизил ключевую ставку до 19%',
    description: 'Совет директоров Банка России принял решение снизить ключевую ставку на 200 б.п.',
    category: 'economy',
    date: '2 часа назад',
    isImportant: true,
  },
  {
    id: 2,
    title: 'Российские учёные создали новый квантовый компьютер',
    description: 'Прорыв в квантовых технологиях: производительность увеличена в 10 раз',
    category: 'tech',
    date: '4 часа назад',
  },
  {
    id: 3,
    title: 'Сборная России вышла в финал чемпионата мира',
    description: 'Решающий матч состоится в эту субботу в Москве',
    category: 'sport',
    date: '5 часов назад',
    isImportant: true,
  },
  {
    id: 4,
    title: 'Новый законопроект о цифровизации образования',
    description: 'Минпросвещения представило концепцию развития цифровых технологий в школах',
    category: 'politics',
    date: '6 часов назад',
  },
  {
    id: 5,
    title: 'Третьяковская галерея открыла новую выставку',
    description: 'Представлены работы современных российских художников',
    category: 'culture',
    date: '8 часов назад',
  },
  {
    id: 6,
    title: 'Инфляция замедлилась до 7.5%',
    description: 'Росстат опубликовал данные по инфляции за последний месяц',
    category: 'economy',
    date: '1 день назад',
  },
];

const zodiacSigns: ZodiacSign[] = [
  { name: 'Овен', icon: '♈', date: '21.03-19.04', prediction: 'Отличный день для новых начинаний' },
  { name: 'Телец', icon: '♉', date: '20.04-20.05', prediction: 'Финансовая удача на вашей стороне' },
  { name: 'Близнецы', icon: '♊', date: '21.05-20.06', prediction: 'Важные встречи принесут пользу' },
  { name: 'Рак', icon: '♋', date: '21.06-22.07', prediction: 'Семейные дела требуют внимания' },
  { name: 'Лев', icon: '♌', date: '23.07-22.08', prediction: 'День полон творческой энергии' },
  { name: 'Дева', icon: '♍', date: '23.08-22.09', prediction: 'Успех в деловых переговорах' },
  { name: 'Весы', icon: '♎', date: '23.09-22.10', prediction: 'Романтика в воздухе' },
  { name: 'Скорпион', icon: '♏', date: '23.10-21.11', prediction: 'Интуиция подскажет верный путь' },
  { name: 'Стрелец', icon: '♐', date: '22.11-21.12', prediction: 'Путешествия принесут радость' },
  { name: 'Козерог', icon: '♑', date: '22.12-19.01', prediction: 'Карьерный рост близок' },
  { name: 'Водолей', icon: '♒', date: '20.01-18.02', prediction: 'Новые знакомства изменят жизнь' },
  { name: 'Рыбы', icon: '♓', date: '19.02-20.03', prediction: 'Творческие проекты ждут вас' },
];

const weatherForecast: WeatherDay[] = [
  { day: 'Пн', temp: -5, condition: 'Снег', icon: 'CloudSnow' },
  { day: 'Вт', temp: -3, condition: 'Облачно', icon: 'Cloud' },
  { day: 'Ср', temp: -1, condition: 'Солнечно', icon: 'Sun' },
  { day: 'Чт', temp: 0, condition: 'Пасмурно', icon: 'CloudDrizzle' },
  { day: 'Пт', temp: 2, condition: 'Дождь', icon: 'CloudRain' },
  { day: 'Сб', temp: -2, condition: 'Снег', icon: 'CloudSnow' },
  { day: 'Вс', temp: -4, condition: 'Облачно', icon: 'Cloud' },
];

const categoryLabels: Record<NewsCategory, string> = {
  all: 'Все',
  politics: 'Политика',
  economy: 'Экономика',
  tech: 'Технологии',
  sport: 'Спорт',
  culture: 'Культура',
};

const categoryColors: Record<NewsCategory, string> = {
  all: 'bg-gray-100 text-gray-800',
  politics: 'bg-blue-100 text-blue-800',
  economy: 'bg-green-100 text-green-800',
  tech: 'bg-purple-100 text-purple-800',
  sport: 'bg-orange-100 text-orange-800',
  culture: 'bg-pink-100 text-pink-800',
};

function Index() {
  const [activeTab, setActiveTab] = useState('news');
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('all');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);



  const handleNotificationPermission = async () => {
    const token = await requestNotificationPermission();
    if (token) {
      setNotificationsEnabled(true);
      localStorage.setItem('fcm_token', token);
      toast({
        title: 'Уведомления включены',
        description: 'Вы будете получать важные новости даже когда сайт закрыт',
      });
      console.log('FCM Token saved:', token);
    } else {
      toast({
        title: 'Уведомления отключены',
        description: 'Разрешите уведомления в настройках браузера',
        variant: 'destructive',
      });
    }
  };

  const sendTestNotification = async () => {
    if (!('Notification' in window)) {
      toast({
        title: 'Не поддерживается',
        description: 'Ваш браузер не поддерживает уведомления',
        variant: 'destructive',
      });
      return;
    }

    if (Notification.permission !== 'granted') {
      toast({
        title: 'Включите уведомления',
        description: 'Нажмите кнопку "Выкл" чтобы разрешить уведомления',
        variant: 'destructive',
      });
      return;
    }

    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        
        const randomNews = mockNews[Math.floor(Math.random() * mockNews.length)];
        
        await registration.showNotification('🔔 Новая важная новость!', {
          body: randomNews.title,
          icon: '/favicon.svg',
          badge: '/favicon.svg',
          tag: 'test-notification',
          requireInteraction: false,
          data: {
            url: '/'
          }
        });

        toast({
          title: 'Уведомление отправлено',
          description: 'Проверьте уведомления на телефоне',
        });
      } catch (error) {
        console.error('Error sending notification:', error);
        toast({
          title: 'Ошибка',
          description: 'Не удалось отправить уведомление',
          variant: 'destructive',
        });
      }
    }
  };

  useEffect(() => {
    onMessageListener()
      .then((payload: any) => {
        toast({
          title: payload?.notification?.title || 'Новое уведомление',
          description: payload?.notification?.body || '',
        });
      })
      .catch((err) => console.log('Failed to receive message: ', err));

    const checkNotificationPermission = () => {
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          setNotificationsEnabled(true);
        }
      }
    };

    checkNotificationPermission();
  }, []);

  const filteredNews = selectedCategory === 'all' 
    ? mockNews 
    : mockNews.filter(news => news.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">Новости</h1>
          <Button
            variant={notificationsEnabled ? "default" : "outline"}
            size="sm"
            onClick={handleNotificationPermission}
            className="gap-2"
          >
            <Icon name={notificationsEnabled ? "BellRing" : "Bell"} size={16} />
            {notificationsEnabled ? 'Вкл' : 'Уведомления'}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4">
        {activeTab === 'news' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {(Object.keys(categoryLabels) as NewsCategory[]).map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className="whitespace-nowrap"
                >
                  {categoryLabels[cat]}
                </Button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredNews.map((news) => (
                <Card 
                  key={news.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={categoryColors[news.category]}>
                            {categoryLabels[news.category]}
                          </Badge>
                          {news.isImportant && (
                            <Badge variant="destructive" className="gap-1">
                              <Icon name="AlertCircle" size={12} />
                              Важно
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-base leading-tight">
                          {news.title}
                        </CardTitle>
                      </div>
                    </div>
                    <CardDescription className="text-sm">
                      {news.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{news.date}</span>
                      <Button variant="ghost" size="sm" className="h-8 gap-1">
                        <Icon name="Share2" size={14} />
                        Поделиться
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'horoscope' && (
          <div className="space-y-4 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Sparkles" size={20} />
                  Гороскоп на сегодня
                </CardTitle>
                <CardDescription>Выберите свой знак зодиака</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {zodiacSigns.map((sign) => (
                    <Card 
                      key={sign.name} 
                      className="hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <CardHeader className="pb-2">
                        <div className="text-3xl mb-2">{sign.icon}</div>
                        <CardTitle className="text-sm">{sign.name}</CardTitle>
                        <CardDescription className="text-xs">{sign.date}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-xs text-muted-foreground">{sign.prediction}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'weather' && (
          <div className="space-y-4 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Cloud" size={20} />
                  Погода на неделю
                </CardTitle>
                <CardDescription>Москва, Россия</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {weatherForecast.map((day, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="font-medium w-8">{day.day}</div>
                        <Icon name={day.icon as any} size={24} className="text-primary" />
                        <div className="text-sm text-muted-foreground">{day.condition}</div>
                      </div>
                      <div className="text-lg font-bold">
                        {day.temp > 0 ? '+' : ''}{day.temp}°
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Подробности</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Влажность</span>
                  <span className="font-medium">65%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Давление</span>
                  <span className="font-medium">745 мм рт. ст.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ветер</span>
                  <span className="font-medium">3 м/с, С-З</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-4 animate-fade-in">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold">
                    П
                  </div>
                  <div>
                    <CardTitle>Пользователь</CardTitle>
                    <CardDescription>user@example.com</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Настройки уведомлений</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-sm">Push-уведомления</div>
                    <div className="text-xs text-muted-foreground">Важные новости в реальном времени</div>
                  </div>
                  <Button
                    variant={notificationsEnabled ? "default" : "outline"}
                    size="sm"
                    onClick={handleNotificationPermission}
                  >
                    {notificationsEnabled ? 'Вкл' : 'Выкл'}
                  </Button>
                </div>
                <Button
                  variant="secondary"
                  className="w-full gap-2"
                  onClick={sendTestNotification}
                >
                  <Icon name="Send" size={16} />
                  Отправить тестовое уведомление
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">О приложении</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Версия</span>
                  <span>1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Разработчик</span>
                  <span>poehali.dev</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around py-2">
            <Button
              variant={activeTab === 'news' ? 'default' : 'ghost'}
              className="flex-col h-auto py-2 px-4 gap-1"
              onClick={() => setActiveTab('news')}
            >
              <Icon name="Newspaper" size={20} />
              <span className="text-xs">Новости</span>
            </Button>
            <Button
              variant={activeTab === 'horoscope' ? 'default' : 'ghost'}
              className="flex-col h-auto py-2 px-4 gap-1"
              onClick={() => setActiveTab('horoscope')}
            >
              <Icon name="Sparkles" size={20} />
              <span className="text-xs">Гороскоп</span>
            </Button>
            <Button
              variant={activeTab === 'weather' ? 'default' : 'ghost'}
              className="flex-col h-auto py-2 px-4 gap-1"
              onClick={() => setActiveTab('weather')}
            >
              <Icon name="Cloud" size={20} />
              <span className="text-xs">Погода</span>
            </Button>
            <Button
              variant={activeTab === 'profile' ? 'default' : 'ghost'}
              className="flex-col h-auto py-2 px-4 gap-1"
              onClick={() => setActiveTab('profile')}
            >
              <Icon name="User" size={20} />
              <span className="text-xs">Профиль</span>
            </Button>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Index;