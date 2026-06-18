import { Car, Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'wouter';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Car className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-bold text-white">CarXpert</span>
            </Link>
            <p className="text-sm">
              منصتك الموثوقة لبيع وشراء السيارات في الشرق الأوسط
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">روابط سريعة</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/cars" className="hover:text-primary-500">
                  تصفح السيارات
                </Link>
              </li>
              <li>
                <Link href="/dealerships" className="hover:text-primary-500">
                  المعارض
                </Link>
              </li>
              <li>
                <Link href="/service-centers" className="hover:text-primary-500">
                  مراكز الخدمة
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">الدعم</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-primary-500">
                  الأسئلة الشائعة
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-500">
                  سياسة الخصوصية
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-500">
                  الشروط والأحكام
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">تواصل معنا</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+966 50 123 4567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>info@carxpert.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>الرياض، المملكة العربية السعودية</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} CarXpert. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}
