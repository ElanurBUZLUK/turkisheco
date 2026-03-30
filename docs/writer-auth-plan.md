# Writer Auth Plan

## URL Strategy

Writer giriş URL'i `/{username}` yerine `/w/{username}` olarak sabitlendi.

Örnek:

- `/w/laika`
- `/w/editor-ayse`

Bu kararın sebebi public site route'ları ile çakışmayı önlemektir. Böylece aşağıdaki alanlar normal uygulama route'u olarak kalır:

- `/`
- `/posts/:slug`
- `/forum`
- `/admin/posts`
- `/account/*`

## Access Model

Sistem üç ayrı erişim yüzeyi olarak ele alınacak:

- `visitor`: public blog ve topluluk sayfalarını görür
- `writer`: kendi writer giriş akışı ile OTP üzerinden oturum açar
- `super_admin`: writer oluşturur, yönetir, yayın ve içerik kontrolü yapar

## Role Matrix

| Alan / İşlem | visitor | writer | super_admin |
| --- | --- | --- | --- |
| Blog içeriklerini görüntüleme | yes | yes | yes |
| Forum başlığı açma | no auth olmadan hayır | yes | yes |
| `/w/{username}` giriş ekranını açma | yes | yes | yes |
| Writer OTP doğrulama | no | yes | yes |
| Yeni yazı oluşturma | no | yes | yes |
| Kendi yazılarını düzenleme | no | yes | yes |
| Başka writer'ın yazılarını düzenleme | no | no | yes |
| Writer oluşturma / pasife alma | no | no | yes |

## Next Steps

Bu URL kararı üstüne sıradaki teknik işler:

1. `Writer` ve `WriterLoginCode` tablolarını eklemek
2. Admin paneline writer yönetimi eklemek
3. `/w/{username}` ekranını OTP kod isteme ve doğrulama akışına çevirmek
4. Writer oturumunu mevcut user/forum auth akışından ayırmak
