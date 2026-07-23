# Regenerates a project-page asset from the paper's experiment data (../../fig_data/*.npz).
# Run with the project's verify/.venv python. See ../README.md.

import numpy as np, matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Circle, Polygon, FancyArrow
from PIL import Image

d=np.load('/home/home/mppi_koopman/fig_data/fig2_unicycle.npz',allow_pickle=True)
start=d['start_pose']; goal=d['goal_pose']; arrow=d['goal_arrow_dxdy']
lim=float(d['axis_lim']); thr=float(d['park_threshold'])
panels=[('traj_a','stop_step_a','Ours · bilinear Koopman','#2f6df6'),
        ('traj_b','stop_step_b','Oracle · true dynamics','#12a150'),
        ('traj_c','stop_step_c','Linear Koopman','#e5484d')]
trajs=[(d[t].astype(float), int(d[s]), name, col) for t,s,name,col in panels]
maxT=max(len(t) for t,_,_,_ in trajs)

INK='#12141c'; MUT='#8a90a0'; GRID='#e6e8ee'; PAPER='#ffffff'
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':11})

def robot(ax,x,y,th,col,scale=0.19):
    pts=np.array([[scale*1.5,0],[-scale,scale*0.9],[-scale,-scale*0.9]])
    R=np.array([[np.cos(th),-np.sin(th)],[np.sin(th),np.cos(th)]])
    pts=(R@pts.T).T+[x,y]
    ax.add_patch(Polygon(pts,closed=True,fc=col,ec='white',lw=1.4,zorder=6))

def draw_static(ax,name,col):
    ax.set_xlim(-lim,lim); ax.set_ylim(-lim,lim); ax.set_aspect('equal')
    ax.set_facecolor(PAPER)
    for s in ax.spines.values(): s.set_color(GRID)
    ax.set_xticks([]); ax.set_yticks([])
    ax.grid(True,color=GRID,lw=0.8)
    # park threshold ring
    ax.add_patch(Circle((goal[0],goal[1]),thr,fc='none',ec=col,ls=(0,(4,3)),lw=1.3,alpha=0.6,zorder=2))
    # goal heading arrow
    an=np.hypot(*arrow); u=arrow/an*0.42
    ax.add_patch(FancyArrow(goal[0],goal[1],u[0],u[1],width=0.03,head_width=0.16,
                head_length=0.14,fc=INK,ec='none',zorder=5,length_includes_head=True))
    ax.plot(goal[0],goal[1],marker='*',ms=17,color=INK,zorder=6,mec='white',mew=0.8)
    ax.plot(start[0],start[1],marker='o',ms=8,mfc='white',mec=MUT,mew=1.6,zorder=4)
    ax.set_title(name,fontsize=12.5,color=INK,fontweight='bold',pad=10)

frames=[]
step=2
idxs=list(range(0,maxT,step))+[maxT-1]*8  # hold at end
for fi in idxs:
    fig,axes=plt.subplots(1,3,figsize=(11.4,4.15),dpi=95)
    fig.patch.set_facecolor(PAPER)
    for ax,(traj,stop,name,col) in zip(axes,trajs):
        draw_static(ax,name,col)
        k=min(fi,len(traj)-1)
        seg=traj[:k+1]
        ax.plot(seg[:,0],seg[:,1],color=col,lw=2.6,alpha=0.9,zorder=3,solid_capstyle='round')
        x,y,th=traj[k]
        robot(ax,x,y,th,col)
        dist=np.hypot(x-goal[0],y-goal[1])
        parked = dist<thr and k>=stop
        tag = 'PARKED' if parked else f'{dist:.2f} m'
        bc = col if parked else INK
        ax.text(0.5,-0.065,f'step {k:>3d}   ·   {tag}',transform=ax.transAxes,
                ha='center',va='top',fontsize=11,color=bc,
                fontweight='bold' if parked else 'normal')
    fig.suptitle('Unicycle parking — one shared lifting, two rollouts',
                 fontsize=13.5,color=INK,fontweight='bold',y=0.99)
    fig.subplots_adjust(left=0.01,right=0.99,top=0.86,bottom=0.09,wspace=0.06)
    fig.canvas.draw()
    frames.append(Image.fromarray(np.asarray(fig.canvas.buffer_rgba())[:,:,:3].copy()))
    plt.close(fig)

# quantize with shared palette
pal=frames[0].quantize(colors=128,method=Image.MEDIANCUT)
qframes=[f.quantize(palette=pal,dither=Image.NONE) for f in frames]
out='/home/home/mppi_koopman/koopman-mppi/static/gifs/unicycle_parking.gif'
qframes[0].save(out,save_all=True,append_images=qframes[1:],
    duration=70,loop=0,optimize=True,disposal=2)
print('frames',len(frames),'saved',out)
import os;print('size MB',round(os.path.getsize(out)/1e6,2))
