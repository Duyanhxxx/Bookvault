import React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  CheckCircle2,
  Sparkles,
  Camera,
  Flame,
  Bookmark,
  Tag,
  Store,
  History,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BookCover } from '@/components/books/BookCover';

export default function LandingPage() {
  const sampleBooks = [
    { title: 'Atomic Habits', author: 'James Clear', year: '2018', status: 'Đang đọc' },
    { title: 'Clean Code', author: 'Robert C. Martin', year: '2008', status: 'Đã đọc' },
    { title: 'Deep Work', author: 'Cal Newport', year: '2016', status: 'Đang sở hữu' },
    { title: 'Tâm Lý Học Về Tiền', author: 'Morgan Housel', year: '2020', status: 'Muốn đọc' },
    { title: 'Hiệu Ứng Chim Mồi', author: 'Hạo Nhiên', year: '2019', status: 'Đã đọc' },
  ];

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#21201c] flex flex-col selection:bg-[#1e3a2f]/20">
      {/* Navigation */}
      <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[#e7e2d9] bg-[#faf8f5]/90 backdrop-blur-md px-6 sm:px-12 max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e3a2f] text-white shadow-sm">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <span className="font-serif text-xl font-bold tracking-tight text-stone-900 block leading-tight">
              BookVault
            </span>
            <span className="text-[10px] text-stone-500 font-medium tracking-wide">
              Never buy the same book twice
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" className="text-xs font-semibold">
              Đăng nhập
            </Button>
          </Link>
          <Link href="/register">
            <Button className="text-xs font-semibold shadow-sm">
              Tạo tủ sách miễn phí
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-20 sm:pt-24 sm:pb-32 max-w-5xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-800 shadow-2xs">
          <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
          <span>Tủ sách số cá nhân chuẩn phong cách Editorial</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-stone-900 leading-[1.15]">
          &ldquo;Không bao giờ mua trùng <br className="hidden sm:inline" />
          <span className="text-[#1e3a2f] italic underline decoration-emerald-500/40 underline-offset-8">
            một cuốn sách hai lần.
          </span>
          &rdquo;
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-stone-600 font-normal leading-relaxed">
          BookVault giúp bạn lưu giữ toàn bộ sách đã mua, ảnh chụp bìa sách thật, tiến độ đọc, ghi chú tâm đắc và tra cứu tức thì ngay khi đang đứng trong nhà sách.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" className="w-full gap-2 text-sm font-semibold shadow-md h-12 px-8">
              Bắt đầu tạo tủ sách của tôi
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full text-sm font-semibold h-12 px-6">
              Đăng nhập tủ sách
            </Button>
          </Link>
        </div>

        {/* Hero Visual: Tactile Digital Bookshelf Preview */}
        <div className="pt-12 relative max-w-4xl mx-auto">
          {/* Bookshelf wooden shelf line */}
          <div className="rounded-2xl border border-[#e7e2d9] bg-white p-6 sm:p-10 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4 mb-6 text-xs text-stone-500">
              <span className="font-serif font-bold text-stone-800 text-sm">📚 Tủ sách cá nhân của bạn</span>
              <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">5 cuốn sách</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 sm:gap-6 justify-items-center">
              {sampleBooks.map((b, i) => (
                <div key={i} className="flex flex-col items-center text-center space-y-2 group cursor-pointer">
                  <div className="book-shadow-hover transform group-hover:-translate-y-2 transition-all duration-300">
                    <BookCover
                      title={b.title}
                      author={b.author}
                      size="sm"
                      className="w-24 h-36 sm:w-28 sm:h-40"
                    />
                  </div>
                  <div className="pt-1">
                    <p className="font-serif font-semibold text-xs text-stone-800 line-clamp-1">{b.title}</p>
                    <p className="text-[10px] text-stone-500">{b.author}</p>
                    <span className="inline-block mt-1 text-[9px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                      {b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Wooden shelf ledge bar */}
            <div className="mt-6 h-3 rounded-full bg-gradient-to-r from-stone-300 via-stone-200 to-stone-300 shadow-inner" />
          </div>
        </div>
      </section>

      {/* Problem & Solution Section: The Bookstore Scenario */}
      <section className="bg-[#f3eee7]/70 py-20 px-6 sm:px-12 border-y border-[#e7e2d9]">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#1e3a2f]">Tình huống thực tế</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
              Bạn đã từng đứng ở nhà sách và tự hỏi mình đã mua cuốn này chưa?
            </h2>
            <p className="text-stone-600 text-sm">
              Bạn thấy một cuốn sách bìa mới bắt mắt ở Fahasa. Bạn không nhớ chắc chắn ở nhà mình đã có chưa, và kết quả là bạn mua về... rồi phát hiện nó đã nằm trên kệ 6 tháng trước.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="rounded-2xl bg-rose-50/80 border border-rose-200 p-6 space-y-3">
              <h3 className="font-serif text-lg font-bold text-rose-900">❌ Khi chưa dùng BookVault</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-rose-800">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Mua trùng 2-3 cuốn cùng một nội dung vì tái bản đổi bìa khác.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Không nhớ sách đang đọc tới trang mấy, bỏ dở giữa chừng.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Quên mất mình đã mua cuốn sách ở đâu, khi nào và giá bao nhiêu.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Ghi chú trích dẫn hay bị thất lạc trong sổ tay hoặc ảnh chụp rời rạc.</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl bg-emerald-50/80 border border-emerald-200 p-6 space-y-3">
              <h3 className="font-serif text-lg font-bold text-emerald-900">✅ Khi đã có BookVault</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-emerald-800">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Tra cứu 1 giây:</strong> Gõ tên sách hoặc ISBN là biết ngay đã sở hữu chưa.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Ảnh chụp sách thật:</strong> Xem lại hình ảnh cuốn sách vật lý đang nằm ở nhà.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Tiến độ đọc:</strong> Ghi nhận số trang và nhật ký đọc mỗi ngày.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Ghi chú theo trang:</strong> Lưu giữ mọi câu trích dẫn đắt giá nhất.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 sm:px-12 max-w-6xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#1e3a2f]">Tính năng nổi bật</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
            Tất cả những gì một người yêu sách cần
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-[#e7e2d9] bg-white p-6 space-y-3 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-stone-900">Tủ sách số cá nhân</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Phân loại rõ ràng: Đang sở hữu, Đang đọc, Đã đọc, Muốn đọc (Wishlist) và Đã bỏ.
            </p>
          </div>

          <div className="rounded-2xl border border-[#e7e2d9] bg-white p-6 space-y-3 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <Camera className="h-5 w-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-stone-900">Ảnh chụp sách vật lý</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Tải lên ảnh bìa trước, bìa sau, gáy sách và mã ISBN được bảo mật riêng tư trên đám mây.
            </p>
          </div>

          <div className="rounded-2xl border border-[#e7e2d9] bg-white p-6 space-y-3 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <Flame className="h-5 w-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-stone-900">Theo dõi tiến độ đọc</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Cập nhật số trang đã đọc, tỷ lệ % hoàn thành và nhật ký từng phiên đọc theo ngày.
            </p>
          </div>

          <div className="rounded-2xl border border-[#e7e2d9] bg-white p-6 space-y-3 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <Bookmark className="h-5 w-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-stone-900">Ghi chú & Trích dẫn</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Lưu lại bài học tâm đắc gắn liền với số trang cụ thể để dễ dàng tra cứu lại sau này.
            </p>
          </div>

          <div className="rounded-2xl border border-[#e7e2d9] bg-white p-6 space-y-3 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <Store className="h-5 w-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-stone-900">Thông tin mua sách</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Lưu giữ giá tiền mua, ngày mua, nhà sách đã mua (Fahasa, Nhã Nam, Tiki...) và đánh giá sao.
            </p>
          </div>

          <div className="rounded-2xl border border-[#e7e2d9] bg-white p-6 space-y-3 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <Tag className="h-5 w-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-stone-900">Thẻ phân loại tuỳ chỉnh</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Tạo các thẻ mang phong cách riêng như #KinhDoanh, #DocLai, #YeuThich, #TamLyHoc...
            </p>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="bg-[#1e3a2f] text-white py-20 px-6 text-center space-y-6">
        <h2 className="font-serif text-3xl sm:text-5xl font-bold">
          Bắt đầu xây dựng tủ sách số của bạn ngay hôm nay
        </h2>
        <p className="max-w-xl mx-auto text-emerald-100/80 text-sm">
          Miễn phí, tinh gọn và tôn vinh tình yêu dành cho những cuốn sách thật.
        </p>
        <div className="pt-2">
          <Link href="/register">
            <Button size="lg" className="bg-[#faf8f5] text-[#1e3a2f] hover:bg-white text-sm font-bold shadow-lg h-12 px-8">
              Tạo tài khoản BookVault &rarr;
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e7e2d9] bg-[#faf8f5] py-8 px-6 text-center text-xs text-stone-500">
        <p>© {new Date().getFullYear()} BookVault — Never buy the same book twice.</p>
      </footer>
    </div>
  );
}
