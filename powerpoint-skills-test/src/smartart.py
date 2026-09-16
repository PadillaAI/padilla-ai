"""Builds the five DrawingML diagram parts (real SmartArt) for slide 7."""
import uuid

STEPS = [
    ("Apply Online",      "Submit your resume through our campus portal."),
    ("Campus Interview",  "Meet our recruiters when we visit your school."),
    ("Office Visit",      "Tour the new Austin office and meet the team."),
    ("Offer",             "Receive your written offer and start date."),
    ("Day One in Austin", "Onboarding, mentoring, and your first project."),
]
NS = ('xmlns:dgm="http://schemas.openxmlformats.org/drawingml/2006/diagram" '
      'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
      'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"')
HDR = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n'

def gid():
    return "{%s}" % str(uuid.uuid4()).upper()

def data_xml():
    """Data model with the presentation points PowerPoint writes for a laid-out diagram."""
    doc = gid()
    pts, cxns = [], []
    pts.append(
        f'<dgm:pt modelId="{doc}" type="doc">'
        '<dgm:prSet loTypeId="urn:microsoft.com/office/officeart/2005/8/layout/list1" loCatId="list"'
        ' qsTypeId="urn:microsoft.com/office/officeart/2005/8/quickStyle/simple1" qsCatId="simple"'
        ' csTypeId="urn:microsoft.com/office/officeart/2005/8/colors/accent1_2" csCatId="accent1"/>'
        '<dgm:spPr/><dgm:t><a:bodyPr/><a:lstStyle/><a:p><a:endParaRPr lang="en-US"/></a:p></dgm:t></dgm:pt>')
    node_ids = []
    for i, (head, body) in enumerate(STEPS):
        nid, par, sib = gid(), gid(), gid()
        node_ids.append(nid)
        pts.append(
            f'<dgm:pt modelId="{nid}"><dgm:prSet phldrT="[Text]"/><dgm:spPr/><dgm:t><a:bodyPr/><a:lstStyle/>'
            f'<a:p><a:r><a:rPr lang="en-US" sz="1100" b="1" dirty="0"/><a:t>{head}</a:t></a:r></a:p>'
            f'<a:p><a:r><a:rPr lang="en-US" sz="800" dirty="0"/><a:t>{body}</a:t></a:r></a:p></dgm:t></dgm:pt>')
        pts.append(f'<dgm:pt modelId="{par}" type="parTrans" cxnId="{nid}"><dgm:prSet/><dgm:spPr/>'
                   '<dgm:t><a:bodyPr/><a:lstStyle/><a:p><a:endParaRPr lang="en-US"/></a:p></dgm:t></dgm:pt>')
        pts.append(f'<dgm:pt modelId="{sib}" type="sibTrans" cxnId="{nid}"><dgm:prSet/><dgm:spPr/>'
                   '<dgm:t><a:bodyPr/><a:lstStyle/><a:p><a:endParaRPr lang="en-US"/></a:p></dgm:t></dgm:pt>')
        cxns.append(f'<dgm:cxn modelId="{gid()}" srcId="{doc}" destId="{nid}" srcOrd="{i}" destOrd="0"'
                    f' parTransId="{par}" sibTransId="{sib}"/>')
    # presentation points: one root plus one per node
    pres_root = gid()
    pts.append(
        f'<dgm:pt modelId="{pres_root}" type="pres">'
        f'<dgm:prSet presAssocID="{doc}" presName="diagram" presStyleCnt="0">'
        '<dgm:presLayoutVars><dgm:dir/><dgm:animLvl val="lvl"/><dgm:resizeHandles val="exact"/>'
        '</dgm:presLayoutVars></dgm:prSet><dgm:spPr/></dgm:pt>')
    pres_nodes = []
    n = len(node_ids)
    for i, nid in enumerate(node_ids):
        pid = gid()
        pres_nodes.append(pid)
        pts.append(
            f'<dgm:pt modelId="{pid}" type="pres">'
            f'<dgm:prSet presAssocID="{nid}" presName="node" presStyleLbl="node1" presStyleIdx="{i}"'
            f' presStyleCnt="{n}"><dgm:presLayoutVars><dgm:bulletEnabled val="1"/></dgm:presLayoutVars>'
            '</dgm:prSet><dgm:spPr/></dgm:pt>')
        cxns.append(f'<dgm:cxn modelId="{gid()}" type="presOf" srcId="{nid}" destId="{pid}"'
                    ' srcOrd="0" destOrd="0" presId="nodes"/>')
        cxns.append(f'<dgm:cxn modelId="{gid()}" type="presParOf" srcId="{pres_root}" destId="{pid}"'
                    f' srcOrd="{i}" destOrd="0" presId="nodes"/>')
    cxns.append(f'<dgm:cxn modelId="{gid()}" type="presOf" srcId="{doc}" destId="{pres_root}"'
                ' srcOrd="0" destOrd="0" presId=""/>')
    xml = (HDR + f'<dgm:dataModel {NS}>'
           + '<dgm:ptLst>' + ''.join(pts) + '</dgm:ptLst>'
           + '<dgm:cxnLst>' + ''.join(cxns) + '</dgm:cxnLst>'
           + '<dgm:bg/><dgm:whole/>'
           + '<dgm:extLst><a:ext uri="{FF2A5FF4-1AC4-4B0C-9E5A-0C2E1E3B1D2A}">'
             '<dsp:dataModelExt xmlns:dsp="http://schemas.microsoft.com/office/drawing/2008/diagram"'
             ' relId="rId6" minVer="12.0"/></a:ext></dgm:extLst>'
           + '</dgm:dataModel>')
    return xml, pres_nodes

def layout_xml():
    return (HDR + f'<dgm:layoutDef {NS} uniqueId="urn:microsoft.com/office/officeart/2005/8/layout/list1">'
        '<dgm:title val="Basic Block List"/>'
        '<dgm:desc val="Used to show non-sequential or grouped blocks of information."/>'
        '<dgm:catLst><dgm:cat type="list" pri="1000"/></dgm:catLst>'
        '<dgm:layoutNode name="diagram">'
          '<dgm:varLst><dgm:dir val="norm"/><dgm:animLvl val="lvl"/><dgm:resizeHandles val="exact"/></dgm:varLst>'
          '<dgm:alg type="lin"><dgm:param type="linDir" val="fromL"/>'
            '<dgm:param type="nodeHorzAlign" val="ctr"/><dgm:param type="nodeVertAlign" val="mid"/></dgm:alg>'
          '<dgm:shape r:blip=""><dgm:adjLst/></dgm:shape>'
          '<dgm:presOf/>'
          '<dgm:constrLst>'
            '<dgm:constr type="w" for="ch" ptType="node" op="equ"/>'
            '<dgm:constr type="h" for="ch" ptType="node" op="equ"/>'
            '<dgm:constr type="sibSp" refType="w" refFor="ch" refPtType="node" fact="0.08"/>'
            '<dgm:constr type="primFontSz" for="ch" ptType="node" op="equ" val="1100"/>'
          '</dgm:constrLst>'
          '<dgm:ruleLst/>'
          '<dgm:forEach name="nodes" axis="ch" ptType="node">'
            '<dgm:layoutNode name="node">'
              '<dgm:alg type="tx"><dgm:param type="parTxLTRAlign" val="ctr"/>'
                '<dgm:param type="txAnchorVertCh" val="mid"/></dgm:alg>'
              '<dgm:shape type="roundRect" r:blip=""><dgm:adjLst/></dgm:shape>'
              '<dgm:presOf axis="desOrSelf" ptType="node"/>'
              '<dgm:constrLst>'
                '<dgm:constr type="tMarg" refType="primFontSz" fact="0.3"/>'
                '<dgm:constr type="bMarg" refType="primFontSz" fact="0.3"/>'
                '<dgm:constr type="lMarg" refType="primFontSz" fact="0.3"/>'
                '<dgm:constr type="rMarg" refType="primFontSz" fact="0.3"/>'
              '</dgm:constrLst>'
              '<dgm:ruleLst><dgm:rule type="primFontSz" val="5" fact="NaN" max="NaN"/></dgm:ruleLst>'
            '</dgm:layoutNode>'
          '</dgm:forEach>'
        '</dgm:layoutNode></dgm:layoutDef>')

_STYLE_LABELS = ["node0", "node1", "alignNode1", "lnNode1", "fgShp", "bgShp", "sibTrans2D1", "parChTrans2D1"]

def quickstyle_xml():
    scene = ('<dgm:scene3d><a:camera prst="orthographicFront"/>'
             '<a:lightRig rig="threePt" dir="t"/></dgm:scene3d>')
    style = ('<dgm:style><a:lnRef idx="2"><a:scrgbClr r="0" g="0" b="0"/></a:lnRef>'
             '<a:fillRef idx="1"><a:scrgbClr r="0" g="0" b="0"/></a:fillRef>'
             '<a:effectRef idx="0"><a:scrgbClr r="0" g="0" b="0"/></a:effectRef>'
             '<a:fontRef idx="minor"><a:schemeClr val="lt1"/></a:fontRef></dgm:style>')
    labels = ''.join(f'<dgm:styleLbl name="{n}">{scene}<dgm:sp3d/><dgm:txPr/>{style}</dgm:styleLbl>'
                     for n in _STYLE_LABELS)
    return (HDR + f'<dgm:styleDef {NS} uniqueId="urn:microsoft.com/office/officeart/2005/8/quickStyle/simple1">'
            '<dgm:title val="Simple Fill"/><dgm:desc val=""/>'
            '<dgm:catLst><dgm:cat type="simple" pri="10100"/></dgm:catLst>'
            + scene + labels + '</dgm:styleDef>')

def colors_xml():
    def lbl(name, fill):
        return (f'<dgm:styleLbl name="{name}">'
                '<dgm:fillClrLst meth="cycle"><a:srgbClr val="1E2761"/><a:srgbClr val="2F3C7E"/></dgm:fillClrLst>'
                '<dgm:linClrLst meth="repeat"><a:srgbClr val="FFFFFF"/></dgm:linClrLst>'
                '<dgm:effectClrLst/>'
                '<dgm:txLinClrLst/>'
                '<dgm:txFillClrLst meth="repeat"><a:srgbClr val="FFFFFF"/></dgm:txFillClrLst>'
                '<dgm:txEffectClrLst/></dgm:styleLbl>')
    labels = ''.join(lbl(n, 'accent1') for n in _STYLE_LABELS)
    return (HDR + f'<dgm:colorsDef {NS} uniqueId="urn:microsoft.com/office/officeart/2005/8/colors/accent1_2">'
            '<dgm:title val="Colorful Range - Accent Colors 1"/><dgm:desc val=""/>'
            '<dgm:catLst><dgm:cat type="accent1" pri="11200"/></dgm:catLst>'
            + labels + '</dgm:colorsDef>')

def drawing_xml(node_ids, frame_w, frame_h):
    """Cached rendering: five rounded boxes across the frame."""
    NAVY, AMBER, WHITE = "1E2761", "E9A03B", "FFFFFF"
    n = len(node_ids)
    gap = int(frame_w * 0.022)
    bw = (frame_w - gap * (n - 1)) // n
    bh = int(frame_h * 0.80)
    top = (frame_h - bh) // 2
    sps = []
    for i, mid in enumerate(node_ids):
        x = i * (bw + gap)
        fill = NAVY if i % 2 == 0 else "2F3C7E"
        txt_col = WHITE
        head, body = STEPS[i]
        sps.append(
          f'<dsp:sp modelId="{mid}">'
          '<dsp:nvSpPr><dsp:cNvPr id="0" name=""/><dsp:cNvSpPr/></dsp:nvSpPr>'
          f'<dsp:spPr><a:xfrm><a:off x="{x}" y="{top}"/><a:ext cx="{bw}" cy="{bh}"/></a:xfrm>'
          '<a:prstGeom prst="roundRect"><a:avLst><a:gd name="adj" fmla="val 12000"/></a:avLst></a:prstGeom>'
          f'<a:solidFill><a:srgbClr val="{fill}"/></a:solidFill>'
          f'<a:ln w="19050"><a:solidFill><a:srgbClr val="{WHITE}"/></a:solidFill></a:ln></dsp:spPr>'
          '<dsp:txBody><a:bodyPr lIns="45720" tIns="45720" rIns="45720" bIns="45720" anchor="ctr"/><a:lstStyle/>'
          f'<a:p><a:pPr algn="ctr"/><a:r><a:rPr lang="en-US" sz="1000" b="1" kern="1200">'
          f'<a:solidFill><a:srgbClr val="{txt_col}"/></a:solidFill>'
          '<a:latin typeface="Calibri"/></a:rPr>'
          f'<a:t>{head}</a:t></a:r></a:p>'
          f'<a:p><a:pPr algn="ctr"/><a:r><a:rPr lang="en-US" sz="800" kern="1200">'
          f'<a:solidFill><a:srgbClr val="{txt_col}"/></a:solidFill>'
          '<a:latin typeface="Calibri"/></a:rPr>'
          f'<a:t>{body}</a:t></a:r></a:p></dsp:txBody>'
          f'<dsp:txXfrm><a:off x="{x}" y="{top}"/><a:ext cx="{bw}" cy="{bh}"/></dsp:txXfrm></dsp:sp>')
    return (HDR + '<dsp:drawing xmlns:dsp="http://schemas.microsoft.com/office/drawing/2008/diagram"'
            ' xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">'
            '<dsp:spTree><dsp:nvGrpSpPr><dsp:cNvPr id="0" name=""/><dsp:cNvGrpSpPr/></dsp:nvGrpSpPr>'
            '<dsp:grpSpPr/>' + ''.join(sps) + '</dsp:spTree></dsp:drawing>')
