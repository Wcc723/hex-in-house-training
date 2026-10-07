import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  courses,
  getAllSeries,
  getAllWeeks,
  getCoursesBySeries,
  getCoursesByWeek,
  getReferenceCourses,
} from '../data/courses';

const sectionLabel =
  'px-4 py-2 font-display text-[15px] font-semibold tracking-[0.14em] text-faint uppercase';
const courseLink =
  'block rounded-xl px-4 py-3 text-[18px] text-paper transition-colors hover:bg-amber-pop';

export function MenuButton() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const weeks = getAllWeeks();
  const series = getAllSeries();
  const references = getReferenceCourses();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="課程選單"
        title="課程選單"
        aria-expanded={isOpen}
        className={`pressable grid size-12 place-items-center rounded-xl border-2 border-line text-paper ${
          isOpen ? 'bg-amber-pop' : 'bg-panel hover:bg-panel-lift'
        }`}
      >
        <svg
          className="size-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-4 w-[340px] overflow-hidden rounded-2xl border-3 border-line bg-panel shadow-pop">
          <div className="p-2">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="block rounded-xl px-4 py-3 text-[18px] text-muted transition-colors hover:bg-amber-pop hover:text-paper"
            >
              課程首頁
            </Link>
          </div>

          {references.length > 0 && (
            <div className="border-t-2 border-line-soft p-2">
              <p className={sectionLabel}>參考範本</p>
              {references.map((course) => (
                <Link
                  key={course.id}
                  to={course.path}
                  onClick={() => setIsOpen(false)}
                  className={courseLink}
                >
                  {course.title}
                </Link>
              ))}
            </div>
          )}

          {series.map((name) => (
            <div key={name} className="border-t-2 border-line-soft p-2">
              <p className={sectionLabel}>{name}</p>
              {getCoursesBySeries(name).map((course) => (
                <Link
                  key={course.id}
                  to={course.path}
                  onClick={() => setIsOpen(false)}
                  className={courseLink}
                >
                  {course.title}
                </Link>
              ))}
            </div>
          ))}

          {weeks.map((week) => (
            <div key={week} className="border-t-2 border-line-soft p-2">
              <p className={sectionLabel}>Week {week}</p>
              {getCoursesByWeek(week).map((course) => (
                <Link
                  key={course.id}
                  to={course.path}
                  onClick={() => setIsOpen(false)}
                  className={courseLink}
                >
                  {course.title}
                </Link>
              ))}
            </div>
          ))}

          {courses.length === 0 && (
            <p className="p-6 text-center text-[17px] text-faint">尚無課程</p>
          )}
        </div>
      )}
    </div>
  );
}
