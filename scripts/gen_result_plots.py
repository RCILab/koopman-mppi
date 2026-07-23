# Regenerates a project-page asset from the paper's experiment data (../../fig_data/*.npz).
# Run with the project's verify/.venv python. See ../README.md.

import numpy as np, matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
FD='/home/home/mppi_koopman/fig_data/'
OUT='/home/home/mppi_koopman/koopman-mppi/static/plots/'
BLUE='#2f6df6'; GREEN='#12a150'; RED='#e5484d'; INK='#1a1d27'; MUT='#6b7280'; GRID='#e9ebf1'
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':12,'svg.fonttype':'none',
    'axes.edgecolor':'#c9cdd8','axes.linewidth':1.0})

def style(ax):
    ax.grid(True,color=GRID,lw=0.9,zorder=0)
    ax.set_axisbelow(True)
    for s in ['top','right']: ax.spines[s].set_visible(False)
    ax.tick_params(colors=MUT,labelsize=10.5,length=4)
    for lab in ax.get_xticklabels()+ax.get_yticklabels(): lab.set_color(INK)

# ---- Drone open-loop prediction (fig3b) ----
d=np.load(FD+'fig3_drone.npz',allow_pickle=True)
fig,ax=plt.subplots(figsize=(5.2,3.7))
ax.plot(d['hs'],d['err_linear'],'o-',color=RED,lw=2.4,ms=5,label='Linear',zorder=3)
ax.plot(d['hs'],d['err_bilinear'],'s-',color=BLUE,lw=2.6,ms=5,label='Bilinear (ours)',zorder=4)
ax.set_yscale('log'); style(ax)
ax.set_xlabel('prediction horizon (steps)',color=INK,fontsize=11.5)
ax.set_ylabel('world-position error (m)',color=INK,fontsize=11.5)
ax.legend(frameon=False,fontsize=11,loc='center right')
ax.annotate('128× at horizon',xy=(15,d['err_bilinear'][-1]),xytext=(8.5,0.006),
   fontsize=10.5,color=INK,ha='center')
fig.tight_layout(); fig.savefig(OUT+'drone_prediction.svg',transparent=True); plt.close(fig)

# ---- Pendulum width sweep (fig4) ----
d=np.load(FD+'fig4_pendulum_neurons.npz',allow_pickle=True)
fig,ax=plt.subplots(figsize=(5.2,3.7))
n=d['neurons']
ax.plot(n,d['err_linear'],'o-',color=RED,lw=2.4,ms=5,label='Linear Koopman',zorder=3)
ax.plot(n,d['err_bilinear'],'s-',color=BLUE,lw=2.6,ms=5,label='Bilinear (ours)',zorder=4)
ax.axhline(float(d['ref_line_y']),color=MUT,ls=(0,(4,3)),lw=1.3,zorder=2)
ax.set_xscale('log',base=2); ax.set_xticks(n); ax.set_xticklabels([str(x) for x in n])
style(ax)
ax.set_xlabel('hidden neurons per layer',color=INK,fontsize=11.5)
ax.set_ylabel('multi-step error (H=12)',color=INK,fontsize=11.5)
ax.legend(frameon=False,fontsize=11,loc='upper right')
ax.annotate('~4× fewer neurons\nfor equal accuracy',xy=(64,float(d['ref_line_y'])),arrowprops=dict(arrowstyle='->',color='#767d8f',lw=1.2),
   xytext=(40,0.40),fontsize=10,color=INK,ha='left')
fig.tight_layout(); fig.savefig(OUT+'pendulum_width.svg',transparent=True); plt.close(fig)

# ---- Quadrotor horizon (fig5) ----
d=np.load(FD+'fig5_quad.npz',allow_pickle=True)
fig,ax=plt.subplots(figsize=(5.2,3.7))
h=d['horizon']
ax.plot(h,d['lin_full'],'o-',color=RED,lw=2.2,ms=4.5,label='Linear (full state)',zorder=3)
ax.plot(h,d['bi_full'],'s-',color=BLUE,lw=2.4,ms=4.5,label='Bilinear (full state)',zorder=4)
ax.plot(h,d['lin_vel'],'o--',color=RED,lw=1.7,ms=4,alpha=0.55,label='Linear (velocity)',zorder=2)
ax.plot(h,d['bi_vel'],'s--',color=BLUE,lw=1.9,ms=4,alpha=0.55,label='Bilinear (velocity)',zorder=2)
ax.set_yscale('log'); style(ax)
ax.set_xlabel('prediction horizon (steps)',color=INK,fontsize=11.5)
ax.set_ylabel('open-loop prediction error',color=INK,fontsize=11.5)
ax.legend(frameon=False,fontsize=9.5,loc='upper left')
fig.tight_layout(); fig.savefig(OUT+'quad_horizon.svg',transparent=True); plt.close(fig)

# ---- Error tube (fig6) ----
d=np.load(FD+'fig6_tube.npz',allow_pickle=True)
fig,ax=plt.subplots(figsize=(5.2,3.7))
ax.plot(d['step'],d['true_error'],'-',color=BLUE,lw=2.4,label=r'true lifted error',zorder=4)
ax.plot(d['step'],d['tube'],'--',color=RED,lw=2.2,label='certified tube',zorder=3)
ax.set_yscale('log'); style(ax)
ax.set_xlabel('rollout step k',color=INK,fontsize=11.5)
ax.set_ylabel('lifted-space error',color=INK,fontsize=11.5)
ax.legend(frameon=False,fontsize=11,loc='upper left')
ax.annotate('0 violations / 82,000 steps',xy=(20,d['true_error'][20]),xytext=(5,3),
   fontsize=10.5,color=INK)
fig.tight_layout(); fig.savefig(OUT+'error_tube.svg',transparent=True); plt.close(fig)
print('plots saved')
import os
for f in os.listdir(OUT): print(' ',f,round(os.path.getsize(OUT+f)/1024,1),'KB')
