# API bai viet va ban be

Moi endpoint ben duoi yeu cau header `x-user-id: <firebaseUid>` cua mot tai khoan dang hoat dong.
Trong production, middleware Firebase Admin can xac minh ID token va lay UID tu token; khong nen tin truc tiep UID do client gui.

## Ket ban

- `GET /api/friendships?status=pending|accepted`: lay danh sach quan he.
- `POST /api/friendships/requests`, body `{ "userId": "firebase-uid" }`: gui loi moi.
- `PATCH /api/friendships/:id/accept`: nguoi nhan chap nhan loi moi.
- `DELETE /api/friendships/:id`: tu choi, huy loi moi hoac huy ket ban.

## Bai viet

- `GET /api/posts/feed?page=1&limit=20`: bai cua ban than va ban be da xac nhan.
- `GET /api/posts/user/:userId`: bai cua ban than hoac mot nguoi ban.
- `GET /api/posts/:id`: chi tiet bai neu co quyen xem.
- `POST /api/posts`: tao bai voi `content`, `images`, `location`, `category`.
- `PUT /api/posts/:id`: chi tac gia duoc sua.
- `DELETE /api/posts/:id`: chi tac gia duoc xoa.
- `POST /api/posts/:id/like`: thich/bo thich neu co quyen xem.

Loi moi `pending` khong cap quyen xem. Khi huy ket ban, bai cua hai nguoi bien mat khoi feed cua nhau ngay vi quyen duoc kiem tra tren moi request.
