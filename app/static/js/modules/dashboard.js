/* noteX AI - Dashboard (Next-Gen OS Home) */

const DashboardModule = {
  render(container) {
    if (!container) container = document.getElementById('app-view-container');
    if (!container) return;

    container.innerHTML = `
      <div class="nx30-home-container" style="padding: 2rem; max-width: 1400px; margin: 0 auto; display: flex; flex-direction: column; gap: 2rem; width: 100%; box-sizing: border-box;">
        
        <!-- Welcome Header -->
        <div class="nx30-home-header" style="display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <h1 style="font-size: 2.5rem; font-weight: 800; background: linear-gradient(135deg, var(--hyper-accent-emerald), var(--hyper-accent-primary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0 0 0.5rem 0;">Good Morning, User</h1>
            <p style="color: var(--hyper-text-muted); font-size: 1.1rem; margin: 0;">Welcome to your personalized AI workspace. Everything is ready.</p>
          </div>
          <div style="display: flex; gap: 1rem;">
             <button class="hyper-btn hyper-btn-glass" onclick="location.hash='#chat'"><i data-lucide="plus"></i> New Chat</button>
             <button class="hyper-btn hyper-btn-glass" onclick="location.hash='#notes'"><i data-lucide="edit-2"></i> New Note</button>
          </div>
        </div>

        <!-- Main Grid Layout -->
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; flex: 1;">
          
          <!-- Left Column (Composer, Recent Chats, Tools) -->
          <div style="display: flex; flex-direction: column; gap: 2rem;">
            
            <!-- Universal Composer -->
            <div class="nx30-os-composer" style="background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.4); border-radius: 24px; padding: 1.5rem; box-shadow: 0 12px 40px rgba(0,0,0,0.05);">
              <textarea id="homeComposerInput" class="nx30-os-textarea" placeholder="Ask NoteX AI anything, search files, or enter a command..." oninput="this.style.height='auto';this.style.height=this.scrollHeight+'px';" style="font-size: 1.2rem; margin-bottom: 1rem; width: 100%;"></textarea>
              
              <div class="nx30-os-tools" style="display: flex; justify-content: space-between; align-items: center;">
                <div class="nx30-os-tools-left" style="display: flex; gap: 0.5rem; align-items: center;">
                  <button class="nx30-os-icon-btn"><i data-lucide="paperclip"></i></button>
                  <button class="nx30-os-icon-btn"><i data-lucide="image"></i></button>
                  <button class="nx30-os-icon-btn"><i data-lucide="mic"></i></button>
                  <button class="nx30-os-icon-btn"><i data-lucide="globe"></i></button>
                  
                  <div style="width:1px; height:20px; background:rgba(0,0,0,0.1); margin:0 0.5rem;"></div>
                  
                  <div class="nx30-os-chip nx30-os-chip-primary"><i data-lucide="brain"></i> Think Mode</div>
                </div>
                
                <button class="hyper-btn hyper-btn-primary" onclick="DashboardModule.sendToChat()" style="border-radius: 50%; width: 44px; height: 44px; padding: 0; display: flex; align-items: center; justify-content: center;">
                  <i data-lucide="arrow-up"></i>
                </button>
              </div>
            </div>

            <!-- AI Suggestions -->
            <div>
              <h3 style="font-size: 1.1rem; margin-bottom: 1rem; color: var(--hyper-text-primary);"><i data-lucide="sparkles" style="width:18px; color:#5B6CFF; margin-right:5px;"></i> AI Suggestions</h3>
              <div class="nx30-suggestions" style="display: flex; flex-wrap: wrap; gap: 0.75rem;">
                <div class="nx30-sugg-chip">Summarize today's meetings</div>
                <div class="nx30-sugg-chip">Draft a project proposal</div>
                <div class="nx30-sugg-chip">Explain Quantum Physics</div>
                <div class="nx30-sugg-chip">Generate Python boilerplate</div>
                <div class="nx30-sugg-chip">Review my latest code</div>
              </div>
            </div>

            <!-- Recent Chats & Files -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
              <div class="hyper-glass-panel" style="padding: 1.5rem; border-radius: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                  <h3 style="margin: 0; font-size: 1.1rem;"><i data-lucide="message-square" style="width:16px; margin-right:5px;"></i> Recent Chats</h3>
                  <a href="#chat" style="font-size: 0.85rem; color: #5B6CFF; text-decoration: none;">View All</a>
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                  <div class="recent-item" style="padding: 0.75rem; background: var(--hyper-bg-elevated); border-radius: 12px; display: flex; align-items: center; gap: 1rem; cursor: pointer; transition: var(--hyper-transition-fast);">
                    <div style="width: 36px; height: 36px; border-radius: 8px; background: var(--hyper-accent-primary-light); color: var(--hyper-accent-primary); display: flex; align-items: center; justify-content: center;"><i data-lucide="code"></i></div>
                    <div style="flex: 1;"><h4 style="margin: 0; font-size: 0.95rem; color: var(--hyper-text-primary);">React Auth Implementation</h4><p style="margin: 0; font-size: 0.8rem; color: var(--hyper-text-muted);">2 hours ago</p></div>
                  </div>
                  <div class="recent-item" style="padding: 0.75rem; background: var(--hyper-bg-elevated); border-radius: 12px; display: flex; align-items: center; gap: 1rem; cursor: pointer; transition: var(--hyper-transition-fast);">
                    <div style="width: 36px; height: 36px; border-radius: 8px; background: var(--hyper-accent-emerald-light); color: var(--hyper-accent-emerald); display: flex; align-items: center; justify-content: center;"><i data-lucide="file-text"></i></div>
                    <div style="flex: 1;"><h4 style="margin: 0; font-size: 0.95rem; color: var(--hyper-text-primary);">Q3 Marketing Plan</h4><p style="margin: 0; font-size: 0.8rem; color: var(--hyper-text-muted);">Yesterday</p></div>
                  </div>
                </div>
              </div>

              <div class="hyper-glass-panel" style="padding: 1.5rem; border-radius: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                  <h3 style="margin: 0; font-size: 1.1rem;"><i data-lucide="folder" style="width:16px; margin-right:5px;"></i> Recent Notes</h3>
                  <a href="#notes" style="font-size: 0.85rem; color: #5B6CFF; text-decoration: none;">View All</a>
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                  <div class="recent-item" style="padding: 0.75rem; background: var(--hyper-bg-elevated); border-radius: 12px; display: flex; align-items: center; gap: 1rem; cursor: pointer; transition: var(--hyper-transition-fast);">
                    <div style="width: 36px; height: 36px; border-radius: 8px; background: var(--hyper-accent-amber-light); color: var(--hyper-accent-amber); display: flex; align-items: center; justify-content: center;"><i data-lucide="edit-3"></i></div>
                    <div style="flex: 1;"><h4 style="margin: 0; font-size: 0.95rem; color: var(--hyper-text-primary);">Meeting Minutes</h4><p style="margin: 0; font-size: 0.8rem; color: var(--hyper-text-muted);">Today, 10:00 AM</p></div>
                  </div>
                  <div class="recent-item" style="padding: 0.75rem; background: var(--hyper-bg-elevated); border-radius: 12px; display: flex; align-items: center; gap: 1rem; cursor: pointer; transition: var(--hyper-transition-fast);">
                    <div style="width: 36px; height: 36px; border-radius: 8px; background: var(--hyper-accent-rose-light); color: var(--hyper-accent-rose); display: flex; align-items: center; justify-content: center;"><i data-lucide="pin"></i></div>
                    <div style="flex: 1;"><h4 style="margin: 0; font-size: 0.95rem; color: var(--hyper-text-primary);">Project Ideas 2026</h4><p style="margin: 0; font-size: 0.8rem; color: var(--hyper-text-muted);">Pinned</p></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Features Grid (AI Tools) -->
            <div>
              <h3 style="font-size: 1.1rem; margin-bottom: 1rem; color: var(--hyper-text-primary);"><i data-lucide="grid" style="width:18px; color:#5B6CFF; margin-right:5px;"></i> AI Tools</h3>
              <div class="nx30-features-grid" style="grid-template-columns: repeat(3, 1fr);">
                <div class="nx30-feature-card hyper-glass-panel" onclick="location.hash='#chat'">
                  <div class="nx30-feat-icon" style="background: linear-gradient(135deg, #5B6CFF, #7C5CFF);"><i data-lucide="code"></i></div>
                  <h3 class="nx30-feat-title">Code Generator</h3>
                  <p class="nx30-feat-desc">Write, debug, and optimize code.</p>
                </div>
                <div class="nx30-feature-card hyper-glass-panel" onclick="location.hash='#rag'">
                  <div class="nx30-feat-icon" style="background: linear-gradient(135deg, #00C9A7, #059669);"><i data-lucide="file-text"></i></div>
                  <h3 class="nx30-feat-title">Doc Analyzer</h3>
                  <p class="nx30-feat-desc">Chat with large PDF documents.</p>
                </div>
                <div class="nx30-feature-card hyper-glass-panel" onclick="location.hash='#chat'">
                  <div class="nx30-feat-icon" style="background: linear-gradient(135deg, #FF6B6B, #FF8E53);"><i data-lucide="image"></i></div>
                  <h3 class="nx30-feat-title">Image Studio</h3>
                  <p class="nx30-feat-desc">Generate stunning AI visuals.</p>
                </div>
              </div>
            </div>

          </div>

          <!-- Right Column (Stats, Activity, Widgets) -->
          <div style="display: flex; flex-direction: column; gap: 2rem;">
            
            <!-- Storage & Usage Stats -->
            <div class="hyper-glass-panel" style="padding: 1.5rem; border-radius: 20px; background: linear-gradient(135deg, rgba(91,108,255,0.05), rgba(0,201,167,0.05));">
              <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem;"><i data-lucide="pie-chart" style="width:16px; margin-right:5px;"></i> Usage Statistics</h3>
              
              <div style="margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.3rem;">
                  <span>Storage (4.5 / 10 GB)</span> <span>45%</span>
                </div>
                <div style="height: 6px; background: rgba(0,0,0,0.1); border-radius: 3px; overflow: hidden;">
                  <div style="width: 45%; height: 100%; background: #5B6CFF; border-radius: 3px;"></div>
                </div>
              </div>
              
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.3rem;">
                  <span>API Requests</span> <span>1,240 / 5,000</span>
                </div>
                <div style="height: 6px; background: rgba(0,0,0,0.1); border-radius: 3px; overflow: hidden;">
                  <div style="width: 25%; height: 100%; background: #00C9A7; border-radius: 3px;"></div>
                </div>
              </div>
            </div>

            <!-- Calendar / Daily Summary Widget -->
            <div class="hyper-glass-panel" style="padding: 1.5rem; border-radius: 20px;">
              <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem;"><i data-lucide="calendar" style="width:16px; margin-right:5px;"></i> Daily Summary</h3>
              <div style="background: var(--hyper-bg-elevated); padding: 1rem; border-radius: 12px; border-left: 4px solid var(--hyper-accent-primary); margin-bottom: 0.75rem;">
                <h4 style="margin: 0 0 0.25rem 0; font-size: 0.95rem; color: var(--hyper-text-primary);">Review React Notes</h4>
                <p style="margin: 0; font-size: 0.8rem; color: var(--hyper-text-muted);">Scheduled for 2:00 PM</p>
              </div>
              <div style="background: var(--hyper-bg-elevated); padding: 1rem; border-radius: 12px; border-left: 4px solid var(--hyper-accent-emerald);">
                <h4 style="margin: 0 0 0.25rem 0; font-size: 0.95rem; color: var(--hyper-text-primary);">Finish AI Chat module</h4>
                <p style="margin: 0; font-size: 0.8rem; color: var(--hyper-text-muted);">Pending task</p>
              </div>
            </div>

            <!-- Activity Feed -->
            <div class="hyper-glass-panel" style="padding: 1.5rem; border-radius: 20px; flex: 1;">
              <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem;"><i data-lucide="activity" style="width:16px; margin-right:5px;"></i> Recent Activity</h3>
              <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 1rem;">
                <li style="display: flex; gap: 1rem; align-items: flex-start;">
                  <div style="width: 8px; height: 8px; border-radius: 50%; background: #5B6CFF; margin-top: 6px;"></div>
                  <div>
                    <p style="margin: 0; font-size: 0.9rem;">Generated "Python Script" in Chat</p>
                    <span style="font-size: 0.75rem; color: #94A3B8;">10 mins ago</span>
                  </div>
                </li>
                <li style="display: flex; gap: 1rem; align-items: flex-start;">
                  <div style="width: 8px; height: 8px; border-radius: 50%; background: #00C9A7; margin-top: 6px;"></div>
                  <div>
                    <p style="margin: 0; font-size: 0.9rem;">Created new note "Project Ideas"</p>
                    <span style="font-size: 0.75rem; color: #94A3B8;">1 hour ago</span>
                  </div>
                </li>
                <li style="display: flex; gap: 1rem; align-items: flex-start;">
                  <div style="width: 8px; height: 8px; border-radius: 50%; background: #FFB84D; margin-top: 6px;"></div>
                  <div>
                    <p style="margin: 0; font-size: 0.9rem;">Logged in from new device</p>
                    <span style="font-size: 0.75rem; color: #94A3B8;">Yesterday</span>
                  </div>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    `;

    if (typeof lucide !== 'undefined') lucide.createIcons();
  },
  
  sendToChat() {
    const text = document.getElementById('homeComposerInput').value;
    if (text) {
      localStorage.setItem('pendingPrompt', text);
      location.hash = '#chat';
    }
  }
};

window.DashboardModule = DashboardModule;
