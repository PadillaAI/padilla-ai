"""Post-processing: real SmartArt, online-video markup, slide transitions, object animations."""
import re, os, shutil, zipfile, sys
import smartart

ROOT = os.path.dirname(os.path.abspath(__file__))
UNP = os.path.join(ROOT, 'unpacked')
SLIDES = os.path.join(UNP, 'ppt', 'slides')
EMU = 914400

read  = lambda p: open(p, encoding='utf-8').read()
write = lambda p, s: open(p, 'w', encoding='utf-8').write(s)

# ---------------------------------------------------------------- SmartArt --
def add_smartart():
    dgm_dir = os.path.join(UNP, 'ppt', 'diagrams')
    os.makedirs(os.path.join(dgm_dir, '_rels'), exist_ok=True)
    data, node_ids = smartart.data_xml()
    fw, fh = int(6.35 * EMU), int(2.55 * EMU)
    parts = {
        'data1.xml':       data,
        'layout1.xml':     smartart.layout_xml(),
        'quickStyle1.xml': smartart.quickstyle_xml(),
        'colors1.xml':     smartart.colors_xml(),
        'drawing1.xml':    smartart.drawing_xml(node_ids, fw, fh),
    }
    for name, xml in parts.items():
        write(os.path.join(dgm_dir, name), xml)
    # data1 -> drawing1 relationship (rId6, matching the dataModelExt relId)
    write(os.path.join(dgm_dir, '_rels', 'data1.xml.rels'),
          '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n'
          '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
          '<Relationship Id="rId6" Type="http://schemas.microsoft.com/office/2007/relationships/diagramDrawing"'
          ' Target="drawing1.xml"/></Relationships>')

    # slide7 relationships
    rels_path = os.path.join(SLIDES, '_rels', 'slide7.xml.rels')
    rels = read(rels_path)
    used = [int(n) for n in re.findall(r'Id="rId(\d+)"', rels)]
    nxt = max(used) + 1
    base = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/'
    ids = {}
    for key, typ, tgt in [('dm', 'diagramData', 'data1.xml'), ('lo', 'diagramLayout', 'layout1.xml'),
                          ('qs', 'diagramQuickStyle', 'quickStyle1.xml'), ('cs', 'diagramColors', 'colors1.xml')]:
        ids[key] = f'rId{nxt}'
        rels = rels.replace('</Relationships>',
            f'<Relationship Id="rId{nxt}" Type="{base}{typ}" Target="../diagrams/{tgt}"/></Relationships>')
        nxt += 1
    write(rels_path, rels)

    # replace the placeholder rectangle with the diagram graphic frame
    sl = os.path.join(SLIDES, 'slide7.xml')
    xml = read(sl)
    slot = re.compile(r'<p:sp>(?:(?!</p:sp>).)*?<a:off x="457200" y="1234440"/>'
                      r'<a:ext cx="5806440" cy="2331720"/>.*?</p:sp>', re.S)
    frame = (
        '<p:graphicFrame><p:nvGraphicFramePr>'
        '<p:cNvPr id="90" name="Diagram 1"/>'
        '<p:cNvGraphicFramePr/><p:nvPr/></p:nvGraphicFramePr>'
        f'<p:xfrm><a:off x="457200" y="1234440"/><a:ext cx="{int(6.35*EMU)}" cy="{int(2.55*EMU)}"/></p:xfrm>'
        '<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/diagram">'
        '<dgm:relIds xmlns:dgm="http://schemas.openxmlformats.org/drawingml/2006/diagram"'
        ' xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"'
        f' r:dm="{ids["dm"]}" r:lo="{ids["lo"]}" r:qs="{ids["qs"]}" r:cs="{ids["cs"]}"/>'
        '</a:graphicData></a:graphic></p:graphicFrame>')
    xml, n = slot.subn(frame, xml, count=1)
    assert n == 1, 'SmartArt placeholder not found'
    write(sl, xml)

    # content types
    ct_path = os.path.join(UNP, '[Content_Types].xml')
    ct = read(ct_path)
    od = 'application/vnd.openxmlformats-officedocument.drawingml.'
    for name, ctype in [('data1.xml', od + 'diagramData+xml'), ('layout1.xml', od + 'diagramLayout+xml'),
                        ('quickStyle1.xml', od + 'diagramStyle+xml'), ('colors1.xml', od + 'diagramColors+xml'),
                        ('drawing1.xml', 'application/vnd.ms-office.drawingml.diagramDrawing+xml')]:
        ct = ct.replace('</Types>',
            f'<Override PartName="/ppt/diagrams/{name}" ContentType="{ctype}"/></Types>')
    write(ct_path, ct)

# ------------------------------------------------------------ online video --
def fix_video():
    sl = os.path.join(SLIDES, 'slide6.xml')
    xml = read(sl)
    m = re.search(r'<p:pic>\s*<p:nvPicPr><p:cNvPr id="\d+" name="Media 0"/>.*?</p:pic>', xml, re.S)
    assert m, 'video pic not found'
    off = re.search(r'<a:off x="(\d+)" y="(\d+)"/><a:ext cx="(\d+)" cy="(\d+)"/>', m.group(0))
    x, y, cx, cy = off.groups()
    blip = re.search(r'<a:blip r:embed="(rId\d+)"/>', m.group(0)).group(1)
    pic = (
        '<p:pic><p:nvPicPr>'
        '<p:cNvPr id="80" name="Online Video">'
        '<a:hlinkClick xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"'
        ' r:id="" action="ppaction://media"/></p:cNvPr>'
        '<p:cNvPicPr><a:picLocks noGrp="1" noChangeAspect="1"/></p:cNvPicPr>'
        '<p:nvPr><a:videoFile xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"'
        ' r:link="rId1"/>'
        '<p:extLst><p:ext uri="{DAA4B4D4-6D71-4841-9C94-3DE7FCFB9230}">'
        '<p14:media xmlns:p14="http://schemas.microsoft.com/office/powerpoint/2010/main"'
        ' xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:link="rId1"/>'
        '</p:ext></p:extLst></p:nvPr></p:nvPicPr>'
        f'<p:blipFill><a:blip r:embed="{blip}"/><a:stretch><a:fillRect/></a:stretch></p:blipFill>'
        f'<p:spPr><a:xfrm><a:off x="{x}" y="{y}"/><a:ext cx="{cx}" cy="{cy}"/></a:xfrm>'
        '<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>'
        '<a:ln w="19050"><a:solidFill><a:srgbClr val="CADCFC"/></a:solidFill></a:ln></p:spPr></p:pic>')
    write(sl, xml[:m.start()] + pic + xml[m.end():])

# --------------------------------------------------------- unique shape ids --
def renumber(xml):
    """Give every shape on the slide a unique id; return the ids in document order."""
    ids, counter = [], [1]
    def sub(m):
        counter[0] += 1
        if counter[0] == 2 and m.group(1) == '1':      # the spTree itself keeps id=1
            counter[0] = 1
            return m.group(0)
        ids.append(counter[0])
        return f'<p:cNvPr id="{counter[0]}"'
    xml = re.sub(r'<p:cNvPr id="(\d+)"', sub, xml)
    return xml, ids

# ------------------------------------------------------------- transitions --
TRANSITIONS = [
    '<p:transition spd="slow"><p:fade/></p:transition>',
    '<p:transition spd="med"><p:push dir="u"/></p:transition>',
    '<p:transition spd="med"><p:wipe dir="r"/></p:transition>',
    '<p:transition spd="med"><p:split orient="horz" dir="out"/></p:transition>',
    '<p:transition spd="med"><p:cover dir="ld"/></p:transition>',
    '<p:transition spd="slow"><p:zoom dir="in"/></p:transition>',
    '<p:transition spd="med"><p:wheel spokes="4"/></p:transition>',
]

# -------------------------------------------------------------- animations --
# (label, presetID, presetSubtype, animEffect filter) - all entrance effects
EFFECTS = [
    ('Fade',            10, 0,  'fade'),
    ('Wipe Up',         22, 4,  'wipe(up)'),
    ('Blinds',           3, 10, 'blinds(horizontal)'),
    ('Box In',           4, 16, 'box(in)'),
    ('Checkerboard',     5, 10, 'checkerboard(across)'),
    ('Circle In',        6, 16, 'circle(in)'),
    ('Diamond In',       8, 16, 'diamond(in)'),
    ('Dissolve In',      9, 0,  'dissolve'),
    ('Plus In',         12, 16, 'plus(in)'),
    ('Random Bars',     11, 10, 'randombar(horizontal)'),
    ('Split',           13, 26, 'barn(outVertical)'),
    ('Strips',          14, 6,  'strips(downRight)'),
    ('Wedge',           35, 0,  'wedge'),
    ('Wheel 1',         18, 1,  'wheel(1)'),
    ('Wheel 4',         18, 4,  'wheel(4)'),
    ('Wipe Right',      22, 2,  'wipe(right)'),
]
DURATIONS = [500, 750, 1000, 1250, 900]

def timing_xml(spids, offset):
    """One automated ('After Previous') entrance effect per object, each a different animation."""
    cid = [3]                      # 1 = tmRoot, 2 = mainSeq
    def nxt():
        cid[0] += 1
        return cid[0]
    groups, log = [], []
    for i, spid in enumerate(spids):
        label, pid, sub, filt = EFFECTS[(offset + i) % len(EFFECTS)]
        dur = DURATIONS[(offset + i) % len(DURATIONS)]
        log.append((spid, label, dur))
        a, b, c, d, e = nxt(), nxt(), nxt(), nxt(), nxt()
        groups.append(
          f'<p:par><p:cTn id="{a}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
          f'<p:par><p:cTn id="{b}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
          f'<p:par><p:cTn id="{c}" presetID="{pid}" presetClass="entr" presetSubtype="{sub}" fill="hold"'
          f' grpId="0" nodeType="afterEffect">'
          '<p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
          f'<p:set><p:cBhvr><p:cTn id="{d}" dur="1" fill="hold">'
          '<p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn>'
          f'<p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl>'
          '<p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr>'
          '<p:to><p:strVal val="visible"/></p:to></p:set>'
          f'<p:animEffect transition="in" filter="{filt}"><p:cBhvr><p:cTn id="{e}" dur="{dur}"/>'
          f'<p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl></p:cBhvr></p:animEffect>'
          '</p:childTnLst></p:cTn></p:par>'
          '</p:childTnLst></p:cTn></p:par>'
          '</p:childTnLst></p:cTn></p:par>')
    xml = ('<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot">'
           '<p:childTnLst><p:seq concurrent="1" nextAc="seek">'
           '<p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>'
           + ''.join(groups) +
           '</p:childTnLst></p:cTn>'
           '<p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst>'
           '<p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst>'
           '</p:seq></p:childTnLst></p:cTn></p:par></p:tnLst></p:timing>')
    return xml, log

def brand_theme():
    """Give the deck a real design theme: brand color scheme, brand fonts, theme name."""
    tp = os.path.join(UNP, 'ppt', 'theme', 'theme1.xml')
    t = read(tp)
    t = t.replace('name="Office Theme"', 'name="Select National Properties"', 1)
    t = t.replace('<a:clrScheme name="Office">', '<a:clrScheme name="Select National Properties">', 1)
    for tag, val in [('dk2', '1E2761'), ('lt2', 'EAF0FC'), ('accent1', '1E2761'), ('accent2', 'E9A03B'),
                     ('accent3', '2F3C7E'), ('accent4', '4E8A6B'), ('accent5', 'CADCFC'),
                     ('accent6', 'C9812A'), ('hlink', '2F3C7E'), ('folHlink', '7B5EA7')]:
        t = re.sub(rf'<a:{tag}><a:srgbClr val="[0-9A-Fa-f]{{6}}"/></a:{tag}>',
                   f'<a:{tag}><a:srgbClr val="{val}"/></a:{tag}>', t, count=1)
    write(tp, t)

def main():
    brand_theme()
    add_smartart()
    fix_video()
    report = []
    for n in range(1, 8):
        p = os.path.join(SLIDES, f'slide{n}.xml')
        xml = read(p)
        xml, ids = renumber(xml)
        timing, log = timing_xml(ids, offset=(n - 1) * 3)
        tail = TRANSITIONS[n - 1] + timing + '</p:sld>'
        assert xml.rstrip().endswith('</p:sld>')
        xml = xml.rstrip()[:-len('</p:sld>')] + tail
        write(p, xml)
        report.append((n, len(ids), TRANSITIONS[n-1], log))
    for n, count, tr, log in report:
        name = re.search(r'<p:(\w+)[ />]', tr.split('>', 1)[1]).group(1)
        print(f'slide {n}: transition={name:8s} objects={count:2d} '
              f'animations={", ".join(f"{l}({d}ms)" for _, l, d in log)}')

if __name__ == '__main__':
    main()
