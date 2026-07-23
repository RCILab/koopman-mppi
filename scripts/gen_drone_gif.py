# Regenerates a project-page asset from the paper's experiment data (../../fig_data/*.npz).
# Run with the project's verify/.venv python. See ../README.md.

import numpy as np, matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from PIL import Image

d=np.load('/home/home/mppi_koopman/fig_data/fig3_drone.npz',allow_pickle=True)
ref=d['ref_path_full'].astype(float)
ours=d['traj_ours'].astype(float); orac=d['traj_oracle'].astype(float); lin=d['traj_linear'].astype(float)
T=len(ours)
INK='#12141c'; GRID='#e6e8ee'
COL={'ours':'#2f6df6','oracle':'#12a150','linear':'#e5484d'}
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':10})

xlim=(-1.4,1.4); ylim=(-1.1,1.1); zlim=(0.1,1.1)
frames=[]; step=2
idxs=list(range(0,T,step))+[T-1]*8
for fi in idxs:
    fig=plt.figure(figsize=(8.2,5.4),dpi=95); fig.patch.set_facecolor('white')
    ax=fig.add_subplot(111,projection='3d')
    ax.view_init(elev=24,azim=-58)
    ax.set_xlim(*xlim); ax.set_ylim(*ylim); ax.set_zlim(*zlim)
    ax.set_box_aspect((2.8,2.2,1.0))
    # reference full path
    ax.plot(ref[:,0],ref[:,1],ref[:,2],color='0.62',ls=':',lw=1.5,zorder=1)
    k=min(fi,T-1)
    for key,tr in [('linear',lin),('oracle',orac),('ours',ours)]:
        seg=tr[:k+1]
        lw=2.6 if key=='ours' else 2.0
        ax.plot(seg[:,0],seg[:,1],seg[:,2],color=COL[key],lw=lw,zorder=3,solid_capstyle='round')
        ax.scatter(tr[k,0],tr[k,1],tr[k,2],color=COL[key],s=42,edgecolor='white',lw=1.1,zorder=5,depthshade=False)
    ax.set_xlabel('x (m)',labelpad=-4,color=INK,fontsize=9)
    ax.set_ylabel('y (m)',labelpad=-4,color=INK,fontsize=9)
    ax.set_zlabel('z (m)',labelpad=-6,color=INK,fontsize=9)
    ax.tick_params(labelsize=7.5,colors='#6b7280',pad=-2)
    try:
        ax.xaxis.pane.set_facecolor('white'); ax.yaxis.pane.set_facecolor('white'); ax.zaxis.pane.set_facecolor('white')
        for a in (ax.xaxis,ax.yaxis,ax.zaxis):
            a.pane.set_edgecolor(GRID); a.pane.set_alpha(1.0)
            a._axinfo['grid'].update(color=GRID,linewidth=0.7)
    except Exception: pass
    ax.set_title('Body-velocity drone tracking a figure-8',fontsize=13,color=INK,fontweight='bold',pad=-2)
    # legend proxies
    from matplotlib.lines import Line2D
    leg=[Line2D([0],[0],color='0.62',ls=':',lw=1.5,label='reference'),
         Line2D([0],[0],color=COL['ours'],lw=2.6,label='Ours · bilinear'),
         Line2D([0],[0],color=COL['oracle'],lw=2.0,label='Oracle'),
         Line2D([0],[0],color=COL['linear'],lw=2.0,label='Linear')]
    ax.legend(handles=leg,loc='upper left',bbox_to_anchor=(0.0,0.96),fontsize=9.5,
              frameon=False,handlelength=1.6,labelspacing=0.35)
    fig.subplots_adjust(left=0.0,right=1.0,top=1.02,bottom=0.02)
    fig.canvas.draw()
    frames.append(Image.fromarray(np.asarray(fig.canvas.buffer_rgba())[:,:,:3].copy()))
    plt.close(fig)

pal=frames[len(frames)//2].quantize(colors=128,method=Image.MEDIANCUT)
q=[f.quantize(palette=pal,dither=Image.NONE) for f in frames]
out='/home/home/mppi_koopman/koopman-mppi/static/gifs/drone_figure8.gif'
q[0].save(out,save_all=True,append_images=q[1:],duration=70,loop=0,optimize=True,disposal=2)
import os;print('frames',len(frames),'MB',round(os.path.getsize(out)/1e6,2))
Image.open(out).convert('RGB').save('/tmp/claude-1000/-home-home-mppi-koopman/3e9968df-842c-439b-acb4-52906ae489e1/scratchpad/drone_mid.png')
