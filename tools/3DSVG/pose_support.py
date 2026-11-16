"""Bounded pose requests shared by the HTTP server and Blender worker."""
import math

def validate_pose(value):
    if value is None:return None
    if not isinstance(value,dict) or set(value)-{'action','time','bones'}:raise ValueError('Pose inválida.')
    action=value.get('action','');time=value.get('time',.5);bones=value.get('bones',{})
    if not isinstance(action,str) or len(action)>200:raise ValueError('Animação inválida.')
    if isinstance(time,bool) or not isinstance(time,(int,float)) or not math.isfinite(time) or not 0<=time<=1:raise ValueError('O instante deve estar entre 0 e 100%.')
    if not isinstance(bones,dict) or len(bones)>32:raise ValueError('Controles de ossos inválidos.')
    for key,angles in bones.items():
        if not isinstance(key,str) or len(key)>200 or not isinstance(angles,list) or len(angles)!=3:raise ValueError('Rotação inválida.')
        if any(isinstance(v,bool) or not isinstance(v,(int,float)) or not math.isfinite(v) or abs(v)>180 for v in angles):raise ValueError('Use rotações entre -180° e 180°.')
    return {'action':action,'time':float(time),'bones':bones}
