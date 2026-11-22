import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Pill from "../components/Pill.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const features = [
  ["Projects with roles", "Owners manage the project; members collaborate. The last owner can never be removed."],
  ["Tasks that belong to people", "Priorities, due dates, assignees and project-scoped tags."],
  ["Comments and activity", "Discuss on the task. Every membership change is logged."],
];

export default function Landing() {
  const { user } = useAuth();
  const destination = user ? "/dashboard" : "/login";
  return <>
    <Navbar marketing />
    <main className="landing">
      <section className="landing-hero">
        <div className="hero-copy">
          <span className="eyebrow">Project management for small teams</span>
          <h1>Every project, task and teammate in one place.</h1>
          <p>Create projects, invite your crew, assign work and keep the conversation on the task itself.</p>
          <div className="hero-actions"><Link className="button button-primary" to={destination}>{user ? "Open app" : "Start for free"}</Link>{!user && <Link className="button" to="/login">Sign in</Link>}</div>
        </div>
        <div className="mini-board card" aria-label="Example project task board">
          <div className="mini-board-top"><span>Launch Site</span><Pill value="active" /></div>
          <ProgressBar value={60} />
          <div className="mini-board-cols">
            <div><span className="muted">To do</span><div className="mini-task">Write API docs<br /><Pill kind="priority" value="medium" /></div><div className="mini-task">Set up CI<br /><Pill kind="priority" value="low" /></div></div>
            <div><span className="muted">Done</span><div className="mini-task">Design schema<br /><Pill kind="priority" value="high" /></div></div>
          </div>
        </div>
      </section>
      <section id="features" className="features-grid" aria-label="Features">
        {features.map(([title, description]) => <article className="feature-card card" key={title}><h3>{title}</h3><p>{description}</p></article>)}
      </section>
      <section id="how-it-works" className="how-it-works card" aria-labelledby="how-it-works-title">
        <div><span className="eyebrow">A simple workflow</span><h2 id="how-it-works-title">How it works</h2><p className="muted">Bring your team’s work together in a few steps.</p></div>
        <div className="how-it-works-steps">
          <article><span>01</span><div><h3>Create a project</h3><p>Give the work a home and invite your teammates.</p></div></article>
          <article><span>02</span><div><h3>Organize tasks</h3><p>Set priorities, due dates, and clear ownership.</p></div></article>
          <article><span>03</span><div><h3>Move forward together</h3><p>Share updates, discuss tasks, and track progress.</p></div></article>
        </div>
      </section>
      <footer>© Depot</footer>
    </main>
  </>;
}
