import { Link } from 'react-router-dom';
import { Asset } from '../components';
import { HexBadge } from '../components/HexBadge';
import {
  courses,
  getAllSeries,
  getAllWeeks,
  getCoursesBySeries,
  getCoursesByWeek,
  getReferenceCourses,
  type Course,
} from '../data/courses';

const shortcuts = [
  { keys: ['→', 'Space', 'PageDown'], action: '下一步' },
  { keys: ['←', 'PageUp'], action: '上一步' },
  { keys: ['Home', 'End'], action: '第一步 / 最後一步' },
  { keys: ['F'], action: '全螢幕' },
  { keys: ['B'], action: '黑幕' },
  { keys: ['H'], action: '隱藏頁首頁尾' },
];

/** 課程卡片輪流用的糖果色，跟素材牆同一組 */
const cardPops = [
  'bg-amber-pop',
  'bg-acid-pop',
  'bg-sky-pop',
  'bg-teal-pop',
  'bg-violet-pop',
  'bg-coral-pop',
];

function CourseCard({ course, index }: { course: Course; index: number }) {
  return (
    <Link
      to={course.path}
      className="group flex items-center gap-5 rounded-2xl border-3 border-line bg-panel px-6 py-5 shadow-pop transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none"
    >
      <HexBadge
        size={44}
        fillClass={cardPops[index % cardPops.length]}
        textClass="text-paper"
      >
        <span className="font-display text-lg leading-none font-semibold">
          {String(index + 1).padStart(2, '0')}
        </span>
      </HexBadge>
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-xl font-semibold text-paper">
          {course.title}
        </h3>
        {course.description && (
          <p className="mt-1 text-sm text-muted">{course.description}</p>
        )}
      </div>
      <svg
        className="size-6 shrink-0 text-paper transition-transform group-hover:translate-x-1"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

function SectionHeading({ label, note }: { label: string; note?: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <HexBadge size={22} fillClass="bg-amber-pop" />
      <h2 className="font-display text-xl font-semibold tracking-wide text-paper">
        {label}
      </h2>
      {note && <span className="text-sm text-faint">{note}</span>}
    </div>
  );
}

function CourseList({ list }: { list: Course[] }) {
  return (
    <div className="grid gap-5">
      {list.map((course, index) => (
        <CourseCard key={course.id} course={course} index={index} />
      ))}
    </div>
  );
}

export function Home() {
  const weeks = getAllWeeks();
  const series = getAllSeries();
  const references = getReferenceCourses();

  return (
    <div className="bg-dots min-h-full overflow-auto px-8 py-14">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-center gap-8">
          <div className="min-w-0 flex-1">
            <p className="inline-block -rotate-2 rounded-full border-2 border-line bg-amber-pop px-4 py-1 font-display text-sm font-semibold tracking-wide text-paper shadow-pop-sm">
              六角學院 · 內部教育訓練
            </p>
            <h1 className="mt-6 font-display text-5xl leading-tight font-semibold tracking-tight text-paper">
              <span className="marker">互動式教學簡報</span>
            </h1>
            {/* 參考範本可能被移到內部版，對外版沒有那一份時這句話就不能提它 */}
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">
              固定 1920×1080 的 16:9 舞台，內容以能動手玩的互動範例為主。選一份簡報開始
              {references.length > 0
                ? '，或先看版型示範了解可用的版型與色票。'
                : '。'}
            </p>
          </div>
          <Asset
            id="hex-mascot"
            size={280}
            alt=""
            className="float-slow hidden h-auto w-[300px] sm:block"
          />
        </header>

        {references.length > 0 && (
          <section className="mt-14">
            <SectionHeading label="參考範本" note="開新課程請從這裡複製" />
            <CourseList list={references} />
          </section>
        )}

        {series.map((name) => (
          <section key={name} className="mt-14">
            <SectionHeading label={name} />
            <CourseList list={getCoursesBySeries(name)} />
          </section>
        ))}

        {weeks.map((week) => (
          <section key={week} className="mt-14">
            <SectionHeading label={`Week ${week}`} />
            <CourseList list={getCoursesByWeek(week)} />
          </section>
        ))}

        {courses.length === 0 && (
          <p className="mt-14 text-center text-muted">目前沒有可用的課程</p>
        )}

        <section className="mt-16 rounded-3xl border-3 border-line bg-panel px-7 py-6 shadow-pop">
          <SectionHeading label="鍵盤操作" />
          <dl className="grid gap-x-10 gap-y-3 sm:grid-cols-2">
            {shortcuts.map((shortcut) => (
              <div
                key={shortcut.action}
                className="flex items-center justify-between gap-4 border-b-2 border-line-soft pb-2.5"
              >
                <dt className="flex flex-wrap gap-1.5">
                  {shortcut.keys.map((key) => (
                    <kbd
                      key={key}
                      className="rounded-lg border-2 border-line bg-ink-soft px-2 py-0.5 text-xs font-semibold text-paper shadow-pop-sm"
                    >
                      {key}
                    </kbd>
                  ))}
                </dt>
                <dd className="text-sm text-muted">{shortcut.action}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 text-sm text-faint">
            目前步驟會記在網址（?s=3），可以直接跳頁或把單頁連結分享出去。
          </p>
        </section>
      </div>
    </div>
  );
}
