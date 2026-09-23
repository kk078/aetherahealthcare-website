"""Convert official BodyParts3D OBJ elements to attributed, named glTF meshes.
Run with the downloaded PART-OF 4.0 archive and tables in the input directory.
Geometry is not sculpted or repositioned: millimeters become meters; Z-up becomes Y-up.
"""
from pathlib import Path
from collections import defaultdict
import array, hashlib, json, math, struct, sys, zipfile
import re

if len(sys.argv) != 3:
    raise SystemExit('Usage: python3 scripts/build-anatomy-models.py INPUT_DIRECTORY OUTPUT_DIRECTORY')
source=Path(sys.argv[1])
output=Path(sys.argv[2])
output.mkdir(parents=True,exist_ok=True)
archive=source/'partof_BP3D_4.0_obj_99.zip'
z=zipfile.ZipFile(archive)
assert z.testzip() is None
names={}; elements=defaultdict(list)
for line in (source/'partof_parts_list_e.txt').read_text().splitlines()[1:]:
    fma,representation,name=line.split('\t'); names[fma]=name
for line in (source/'partof_element_parts.txt').read_text().splitlines()[1:]:
    fma,name,element=line.split('\t'); elements[fma].append(element)
spec=[
 ('FMA46565','head','skeleton'),('FMA13478','spine','skeleton'),('FMA7480','thorax','skeleton'),
 ('FMA13322','upper-limb','skeleton'),('FMA13323','upper-limb','skeleton'),('FMA13395','upper-limb','skeleton'),('FMA13396','upper-limb','skeleton'),
 ('FMA23130','upper-limb','skeleton'),('FMA23131','upper-limb','skeleton'),('FMA23464','upper-limb','skeleton'),('FMA23465','upper-limb','skeleton'),('FMA23467','upper-limb','skeleton'),('FMA23468','upper-limb','skeleton'),
 ('FMA16586','pelvis','skeleton'),('FMA16587','pelvis','skeleton'),('FMA24474','lower-limb','skeleton'),('FMA24475','lower-limb','skeleton'),('FMA24477','lower-limb','skeleton'),('FMA24478','lower-limb','skeleton'),('FMA24480','lower-limb','skeleton'),('FMA24481','lower-limb','skeleton'),('FMA24486','lower-limb','skeleton'),('FMA24487','lower-limb','skeleton'),
 ('FMA50801','head','nervous'),
 ('FMA7088','thorax','organs'),('FMA7309','thorax','organs'),('FMA7310','thorax','organs'),('FMA7394','thorax','organs'),
 ('FMA7197','abdomen','organs'),('FMA7148','abdomen','organs'),('FMA7198','abdomen','organs'),('FMA7202','abdomen','organs'),('FMA7200','abdomen','organs'),('FMA7201','abdomen','organs'),
 ('FMA7204','pelvis','organs'),('FMA7205','pelvis','organs'),('FMA15900','pelvis','organs'),('FMA9600','pelvis','organs'),
 ('FMA58828','head','organs'),('FMA58829','head','organs'),('FMA3734','thorax','organs'),
 ('FMA7163','surface','surface')]
# Source PART-OF composites include adjacent tissues. Curate the displayed skull
# to bones, leaving the separately named eyes in the organ layer.
element_names={}
for path in z.namelist():
    if path.endswith('.obj'):
        header=z.read(path).decode().split('v ',1)[0]
        element_names[Path(path).stem]=re.search(r'# English name : (.*)',header).group(1)
elements['FMA46565']=[e for e in elements['FMA46565'] if not any(word in element_names[e].lower() for word in ['eye','choroid','cornea','iris','lacrimal gland','lens','vitreous','hyoid','sclera'])]
names['FMA13478']='vertebral column and intervertebral discs'
# The hand/foot aggregates in this archive contain bony elements, not all tissues.
bone_used=set(e for f,r,l in spec if l=='skeleton' for e in elements[f])
for side,fma,region in [('right','FMA9713','upper-limb'),('left','FMA9714','upper-limb'),('right','FMA11343','lower-limb'),('left','FMA11344','lower-limb')]:
    key=fma+'-bones'; names[key]=side+' '+('hand' if region=='upper-limb' else 'foot')+' bones'
    elements[key]=[e for e in elements[fma] if e not in bone_used]
    if region=='upper-limb':
        elements[key] += [e for e,n in element_names.items() if side in n.lower() and any(b in n.lower() for b in ['lunate','scaphoid','triquetral','pisiform','trapezium','trapezoid','capitate','hamate']) and e not in bone_used and e not in elements[key]]
    bone_used.update(elements[key]);spec.append((key,region,'skeleton'))

manifest={'dataset':'BodyParts3D 4.0 PART-OF, 99% polygon reduction archive','source':'https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html','license':'https://creativecommons.org/licenses/by/4.0/','licenseStatement':'https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html','attribution':'BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International','reviewed':'2026-09-23','archiveSha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'adaptations':'OBJ to glTF; millimeters to meters; axis conversion; display colors; selected compound structures; shared elements are rendered once. No anatomical sculpting. Omitted incomplete spinal-cord composite (only a short central-canal fragment in the source). Ocular structures are the vitreous bodies; composite right-eye meshes have cross-midline outliers and are not used. Original archive headers retain the historical BY-SA 2.1 text; the publisher’s current license page (updated 2025-02-27) specifies CC BY 4.0.','reference':'Adult male reference; no female reproductive or pediatric model. Reduced meshes are educational surfaces, not diagnostic images or measurement tools.','structures':[],'files':{}}
used=set()
for layer in ['skeleton','organs','nervous','surface']:
    gltf={'asset':{'version':'2.0','generator':'Aethera BodyParts3D educational conversion'},'scene':0,'scenes':[{'nodes':[]}],'nodes':[],'meshes':[],'buffers':[],'bufferViews':[],'accessors':[]}
    binary=bytearray()
    def accessor(values,type_,component,count,min_=None,max_=None):
        while len(binary)%4: binary.append(0)
        data=array.array('f' if component==5126 else 'I',values)
        if sys.byteorder!='little':data.byteswap()
        raw=data.tobytes();view=len(gltf['bufferViews']);gltf['bufferViews'].append({'buffer':0,'byteOffset':len(binary),'byteLength':len(raw)})
        binary.extend(raw);a={'bufferView':view,'componentType':component,'count':count,'type':type_}
        if min_ is not None:a['min']=min_;a['max']=max_
        gltf['accessors'].append(a);return len(gltf['accessors'])-1
    for fma,region,item_layer in spec:
        if item_layer!=layer:continue
        vertices=[];indices=[];parts=[]
        for e in elements[fma]:
            if e in used:continue
            path='partof_BP3D_4.0_obj_99/'+e+'.obj'
            assert path in z.namelist(),path
            used.add(e);parts.append(e);offset=len(vertices)//3
            for line in z.read(path).decode().splitlines():
                if line.startswith('v '):
                    x,y,up=map(float,line.split()[1:4]);vertices.extend([x/1000,up/1000,-y/1000])
                elif line.startswith('f '):
                    face=[int(s.split('/')[0])-1+offset for s in line.split()[1:]]
                    for i in range(1,len(face)-1):indices.extend([face[0],face[i],face[i+1]])
        if not indices:continue
        normals=[0.0]*len(vertices)
        for i in range(0,len(indices),3):
            a,b,c=[n*3 for n in indices[i:i+3]]
            ab=[vertices[b+k]-vertices[a+k] for k in range(3)];ac=[vertices[c+k]-vertices[a+k] for k in range(3)]
            normal=[ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]]
            for p in [a,b,c]:
                for k in range(3):normals[p+k]+=normal[k]
        for i in range(0,len(normals),3):
            length=math.sqrt(sum(v*v for v in normals[i:i+3])) or 1
            for k in range(3):normals[i+k]/=length
        mins=[min(vertices[k::3]) for k in range(3)];maxs=[max(vertices[k::3]) for k in range(3)]
        p=accessor(vertices,'VEC3',5126,len(vertices)//3,mins,maxs);n=accessor(normals,'VEC3',5126,len(normals)//3);idx=accessor(indices,'SCALAR',5125,len(indices))
        gltf['meshes'].append({'name':fma,'primitives':[{'attributes':{'POSITION':p,'NORMAL':n},'indices':idx}]})
        gltf['nodes'].append({'mesh':len(gltf['meshes'])-1,'name':fma,'extras':{'label':names[fma],'region':region,'layer':layer}})
        gltf['scenes'][0]['nodes'].append(len(gltf['nodes'])-1)
        manifest['structures'].append({'id':fma,'name':names[fma],'region':region,'layer':layer,'bounds':[mins,maxs],'elementIds':parts,'triangles':len(indices)//3})
    gltf['buffers']=[{'byteLength':len(binary)}]
    encoded=json.dumps(gltf,separators=(',',':')).encode();encoded+=b' '*((-len(encoded))%4);binary+=b'\0'*((-len(binary))%4)
    file=struct.pack('<III',0x46546C67,2,12+8+len(encoded)+8+len(binary))+struct.pack('<II',len(encoded),0x4E4F534A)+encoded+struct.pack('<II',len(binary),0x004E4942)+binary
    name=layer+'.glb';(output/name).write_bytes(file)
    manifest['files'][layer]={'path':'/models/anatomy/'+name,'bytes':len(file),'sha256':hashlib.sha256(file).hexdigest()}
    print(layer,len(file),'bytes',len(gltf['meshes']),'structures',flush=True)
(output/'manifest.json').write_text(json.dumps(manifest,indent=2))
(output/'ATTRIBUTION.txt').write_text(manifest['attribution']+'\n'+manifest['license']+'\nSource: '+manifest['source']+'\nLicense statement: '+manifest['licenseStatement']+'\n\n'+manifest['adaptations']+'\n\n'+manifest['reference']+'\n')
print('Total',len(manifest['structures']),'structures',len(used),'source elements')
