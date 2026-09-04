import Link from "next/link";
import { BasicLink, PostList, type ListItem } from "./PostList";

type Props = {
  title: string;
  heading?: React.ReactNode;
  subtitle: string;
  introduction: string;
  children?: React.ReactNode;
  sectionTitle: string;
  items: ListItem[];
};

export default function DepartmentPage({ title, heading, subtitle, introduction, children, sectionTitle, items }: Props) {
  return (
    <main className="homepage department-page" lang="zh-CN">
      <nav className="department-back" aria-label="返回导航"><Link className="basic-link" href="/">HA7CH</Link><span> / {title}</span></nav>
      <article className="article">
        <header>
          <p className="department-eyebrow">{subtitle}</p>
          <h1 className="department-heading">{heading ?? title}</h1>
        </header>
        <p>{introduction}</p>
      </article>
      <PostList title={sectionTitle} items={items} />
      {children}
      <p className="service-contact">有其他合作想法，<BasicLink href="mailto:lawtedwu@gmail.com">联系 Lawted</BasicLink>。</p>
    </main>
  );
}
