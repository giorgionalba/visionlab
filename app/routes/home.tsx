import type { Route } from "./+types/home";
import Navbar from "../../components/Navbar";
import {ArrowRight, ArrowUpRight, Clock, Layers} from "lucide-react";
import Button from "../../components/ui/Button";
import Upload from "../../components/Upload";
import {useNavigate} from "react-router";


export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
    const navigate = useNavigate();

    const handleUploadComplete = (base64Image:string) => {
        const newId = Date.now().toString();
        localStorage.setItem(`visionlab_project_${newId}`, JSON.stringify({ id: newId, image: base64Image }));
        navigate(`/visualizer/${newId}`);
    }
  return (
      <div className="home">
        <Navbar />
        <section className="hero">
            <div className="announce">
                <div className="dot">
                    <div className="pulse"></div>
                </div>
                <p>Introducing VisionLab 2.0</p>
            </div>
            <h1>Build beatiful spaces at the speed of thought with VisionLab</h1>
            <p className="subtitle">VisionLab is an AI design environment that helps you visualize, render and ship architectural projects faster than ever</p>
            <div className="actions">
                <a href="#upload" className="cta">
                    Start Building <ArrowRight className="icon"/>
                </a>
                <Button variant="outline" size="lg" className="demo">
                    Watch Demo
                </Button>
            </div>

            <div id="upload" className="upload-shell">
                <div className="grid-overlay"/>
                <div className="upload-card">
                    <div className="upload-icon">
                        <Layers className="icon"/>
                    </div>
                    <h3>Upload your floor plan</h3>
                    <p> Supports JPN, PNG, formats up to 10MB</p>
                </div>
                <Upload onComplete={handleUploadComplete} />
            </div>
        </section>
          <section className="projects">
              <div className="section-inner">
                  <div className="section-head">
                      <div className="copy">
                          <h2>Projects</h2>
                          <p>Your latest work and shared community projects, all in one place.</p>
                      </div>
                  </div>
                  <div className="projects-grid">
                      <div className="projects-card group">
                          <div className="preview">
                              <img src="https://roomify-mlhuk267-dfwu1i.puter.site/projects/1770803585402/rendered.png" alt="Project" />
                              <div className="badge">
                                  <span>Community</span>
                              </div>
                          </div>
                          <div className="card-body">
                              <div>
                                  <h3>
                                      Project Palermo I
                                  </h3>
                                  <div className="meta">
                                      <Clock size={12} />
                                      <span> {new Date('01.01.2027').toLocaleDateString()}</span>
                                      <span>By Giorgio Nalbandian</span>
                                  </div>
                              </div>
                              <div className="arrow">
                                  <ArrowUpRight size={18} />
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

          </section>
      </div>
  )
}