import svgPaths from "./svg-r9jrla3mu4";
import imgImage from "./dc1d3fe4ad70cd9cf075fd6306568a876f2d54b9.png";

function Icon() {
  return (
    <div className="relative shrink-0 size-[19.99px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.9899 19.9899">
        <g id="Icon">
          <path d={svgPaths.p1d301f80} id="Vector" stroke="var(--stroke-0, #0F0F0F)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="relative shrink-0" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-center relative size-full">
        <Icon />
        <p className="[word-break:break-word] font-['Nunito:Light',sans-serif] font-light leading-[20px] relative shrink-0 text-[#0f0f0f] text-[14px] text-center whitespace-nowrap">cancel</p>
      </div>
    </div>
  );
}

function Heading() {
  return (
    <div className="relative shrink-0" data-name="Heading 2">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="[word-break:break-word] font-['Nunito:ExtraLight',sans-serif] font-extralight leading-[24px] relative shrink-0 text-[#0f0f0f] text-[16px] whitespace-nowrap">edit-mode</p>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="relative rounded-[42885100px] shrink-0" data-name="Button">
      <div aria-hidden className="absolute border-[0.2px] border-black border-solid inset-0 pointer-events-none rounded-[42885100px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center px-[12.2px] py-[6.2px] relative size-full">
        <p className="[word-break:break-word] font-['Nunito:Light',sans-serif] font-light leading-[16px] relative shrink-0 text-[#0f0f0f] text-[12px] text-center whitespace-nowrap">save</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between px-[16px] py-[12px] relative size-full">
          <Button />
          <Heading />
          <Button1 />
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="bg-[rgba(255,255,255,0.9)] relative shrink-0 w-full" data-name="Header">
      <div aria-hidden className="absolute border-[rgba(0,0,0,0.08)] border-b-[1.278px] border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[1.278px] relative size-full">
        <Container />
      </div>
    </div>
  );
}

function FieldLabel() {
  return (
    <div className="relative shrink-0 w-full" data-name="FieldLabel">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <p className="[word-break:break-word] font-['Nunito:Light','Noto_Sans_JP:Light',sans-serif] font-light leading-[16.5px] relative shrink-0 text-[#888] text-[11px] tracking-[1.1px] uppercase whitespace-nowrap">画像</p>
      </div>
    </div>
  );
}

function Image() {
  return (
    <div className="h-[235.525px] relative shrink-0 w-full" data-name="Image (プレビュー)">
      <img alt="" className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage} />
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[11.982px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.982 11.982">
        <g clipPath="url(#clip0_32_1341)" id="Icon">
          <path d={svgPaths.p2f925400} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.9985" />
          <path d={svgPaths.p1d3464b0} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.9985" />
        </g>
        <defs>
          <clipPath id="clip0_32_1341">
            <rect fill="white" height="11.982" width="11.982" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0.5)] left-[236.14px] rounded-[42885100px] top-[195.57px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[6px] items-center px-[12px] py-[6px] relative size-full">
        <Icon1 />
        <p className="[word-break:break-word] font-['Nunito:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[16px] relative shrink-0 text-[12px] text-white whitespace-nowrap">変更</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="bg-[#f2f2f2] content-stretch flex flex-col h-[235.525px] items-start overflow-clip relative rounded-[20px] shrink-0 w-[314.047px]" data-name="Container">
      <Image />
      <Container3 />
    </div>
  );
}

function ContainerMargin() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container (margin)">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[8px] relative size-full">
        <Container2 />
      </div>
    </div>
  );
}

function Section() {
  return (
    <div className="relative shrink-0 w-[314.047px]" data-name="Section">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <FieldLabel />
        <ContainerMargin />
      </div>
    </div>
  );
}

function FieldLabel1() {
  return (
    <div className="h-[25px] relative shrink-0 w-[314.047px]" data-name="FieldLabel">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[8px] relative size-full">
        <p className="[word-break:break-word] font-['Nunito:Light','Noto_Sans_JP:Light',sans-serif] font-light leading-[16.5px] relative shrink-0 text-[#888] text-[11px] tracking-[1.1px] uppercase whitespace-nowrap">メーカー名</p>
      </div>
    </div>
  );
}

function TextInput() {
  return (
    <div className="absolute bg-[#f2f2f2] content-stretch flex flex-col h-[43.954px] items-start justify-center left-0 overflow-clip px-[16px] py-[12px] rounded-[18px] top-[-0.01px] w-[314.047px]" data-name="TextInput">
      <p className="[word-break:break-word] font-['Nunito:Light',sans-serif] font-light leading-[20px] relative shrink-0 text-[#0f0f0f] text-[14px] w-full">Richmore</p>
    </div>
  );
}

function XInlineContainer() {
  return (
    <div className="h-[43.927px] relative shrink-0 w-full" data-name="x-inline-container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <TextInput />
      </div>
    </div>
  );
}

function Section1() {
  return (
    <div className="relative shrink-0 w-[314.047px]" data-name="Section">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[28px] relative size-full">
        <FieldLabel1 />
        <XInlineContainer />
      </div>
    </div>
  );
}

function FieldLabel2() {
  return (
    <div className="relative shrink-0 w-full" data-name="FieldLabel">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <p className="[word-break:break-word] font-['Nunito:Light','Noto_Sans_JP:Light',sans-serif] font-light leading-[16.5px] relative shrink-0 text-[#888] text-[11px] tracking-[1.1px] uppercase whitespace-nowrap">色</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="bg-[#4a4a4a] relative rounded-[18px] shrink-0 size-[43.994px]" data-name="Container">
      <div aria-hidden className="absolute border-[1.278px] border-[rgba(0,0,0,0.08)] border-solid inset-0 pointer-events-none rounded-[18px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]" />
    </div>
  );
}

function Icon2() {
  return (
    <div className="relative shrink-0 size-[7.988px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.98797 7.98797">
        <g clipPath="url(#clip0_32_1345)" id="Icon">
          <path d={svgPaths.p2fb2c6c0} id="Vector" stroke="var(--stroke-0, #888888)" strokeLinecap="round" strokeWidth="1.49774" />
        </g>
        <defs>
          <clipPath id="clip0_32_1345">
            <rect fill="white" height="7.98797" width="7.98797" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container5() {
  return (
    <div className="absolute bg-white left-[31.99px] rounded-[42885100px] size-[15.996px] top-[31.99px]" data-name="Container">
      <div aria-hidden className="absolute border-[1.278px] border-[rgba(0,0,0,0.08)] border-solid inset-0 pointer-events-none rounded-[42885100px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-[1.278px] relative size-full">
        <Icon2 />
      </div>
    </div>
  );
}

function Label() {
  return (
    <div className="relative shrink-0" data-name="Label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Container4 />
        <Container5 />
      </div>
    </div>
  );
}

function TextInput1() {
  return (
    <div className="absolute bg-[#f2f2f2] content-stretch flex flex-col h-[43.954px] items-start justify-center left-0 overflow-clip px-[16px] py-[12px] rounded-[18px] top-0 w-[258.071px]" data-name="TextInput">
      <p className="[word-break:break-word] font-['Nunito:Light','Noto_Sans_JP:Light',sans-serif] font-light leading-[20px] relative shrink-0 text-[#0f0f0f] text-[14px] w-full">チャコール</p>
    </div>
  );
}

function Container6() {
  return (
    <div className="flex-[258.071_0_0] h-[43.954px] min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <TextInput1 />
      </div>
    </div>
  );
}

function ColorPicker() {
  return (
    <div className="relative shrink-0 w-full" data-name="ColorPicker">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center pt-[8px] relative size-full">
        <Label />
        <Container6 />
      </div>
    </div>
  );
}

function Section2() {
  return (
    <div className="relative shrink-0 w-[314.047px]" data-name="Section">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[28px] relative size-full">
        <FieldLabel2 />
        <ColorPicker />
      </div>
    </div>
  );
}

function FieldLabel3() {
  return (
    <div className="relative shrink-0 w-full" data-name="FieldLabel">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <p className="[word-break:break-word] font-['Nunito:Light','Noto_Sans_JP:Light',sans-serif] font-light leading-[16.5px] relative shrink-0 text-[#888] text-[11px] tracking-[1.1px] uppercase whitespace-nowrap">材質</p>
      </div>
    </div>
  );
}

function SelectChip() {
  return (
    <div className="absolute bg-[#f5f5f5] h-[35.966px] left-0 rounded-[42885100px] top-0 w-[73.989px]" data-name="SelectChip">
      <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Nunito:ExtraLight','Noto_Sans_JP:Light',sans-serif] font-extralight leading-[20px] left-[37px] text-[#0f0f0f] text-[14px] text-center top-[6.99px] whitespace-nowrap">ウール</p>
    </div>
  );
}

function SelectChip1() {
  return (
    <div className="absolute bg-[#0f0f0f] drop-shadow-[0px_1px_1.5px_rgba(0,0,0,0.1),0px_1px_1px_rgba(0,0,0,0.1)] h-[35.966px] left-[81.98px] rounded-[42885100px] top-0 w-[115.965px]" data-name="SelectChip">
      <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Nunito:ExtraLight','Noto_Sans_JP:Light',sans-serif] font-extralight leading-[20px] left-[58px] text-[14px] text-center text-white top-[6.99px] whitespace-nowrap">メリノウール</p>
    </div>
  );
}

function SelectChip2() {
  return (
    <div className="absolute bg-[#f5f5f5] h-[35.966px] left-[205.93px] rounded-[42885100px] top-0 w-[87.848px]" data-name="SelectChip">
      <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Nunito:ExtraLight','Noto_Sans_JP:Light',sans-serif] font-extralight leading-[20px] left-[44px] text-[#0f0f0f] text-[14px] text-center top-[6.99px] whitespace-nowrap">アルパカ</p>
    </div>
  );
}

function SelectChip3() {
  return (
    <div className="absolute bg-[#f5f5f5] h-[35.966px] left-0 rounded-[42885100px] top-[43.95px] w-[87.987px]" data-name="SelectChip">
      <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Nunito:ExtraLight','Noto_Sans_JP:Light',sans-serif] font-extralight leading-[20px] left-[44px] text-[#0f0f0f] text-[14px] text-center top-[6.99px] whitespace-nowrap">コットン</p>
    </div>
  );
}

function SelectChip4() {
  return (
    <div className="absolute bg-[#f5f5f5] h-[35.966px] left-[95.98px] rounded-[42885100px] top-[43.95px] w-[87.289px]" data-name="SelectChip">
      <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Nunito:ExtraLight','Noto_Sans_JP:Light',sans-serif] font-extralight leading-[20px] left-[44px] text-[#0f0f0f] text-[14px] text-center top-[6.99px] whitespace-nowrap">アクリル</p>
    </div>
  );
}

function SelectChip5() {
  return (
    <div className="absolute bg-[#f5f5f5] h-[35.966px] left-[191.25px] rounded-[42885100px] top-[43.95px] w-[73.989px]" data-name="SelectChip">
      <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Nunito:ExtraLight','Noto_Sans_JP:Light',sans-serif] font-extralight leading-[20px] left-[37px] text-[#0f0f0f] text-[14px] text-center top-[6.99px] whitespace-nowrap">その他</p>
    </div>
  );
}

function Container7() {
  return (
    <div className="h-[79.92px] relative shrink-0 w-full" data-name="Container">
      <SelectChip />
      <SelectChip1 />
      <SelectChip2 />
      <SelectChip3 />
      <SelectChip4 />
      <SelectChip5 />
    </div>
  );
}

function ContainerMargin1() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container (margin)">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[8px] relative size-full">
        <Container7 />
      </div>
    </div>
  );
}

function Section3() {
  return (
    <div className="h-[132.92px] relative shrink-0 w-[314.047px]" data-name="Section">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[28px] relative size-full">
        <FieldLabel3 />
        <ContainerMargin1 />
      </div>
    </div>
  );
}

function FieldLabel4() {
  return (
    <div className="relative shrink-0 w-full" data-name="FieldLabel">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <p className="[word-break:break-word] font-['Nunito:Light','Noto_Sans_JP:Light',sans-serif] font-light leading-[16.5px] relative shrink-0 text-[#888] text-[11px] tracking-[1.1px] uppercase whitespace-nowrap">ゲージ</p>
      </div>
    </div>
  );
}

function SelectChip6() {
  return (
    <div className="absolute bg-[#f5f5f5] h-[35.966px] left-0 rounded-[42885100px] top-0 w-[59.99px]" data-name="SelectChip">
      <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Nunito:Light','Noto_Sans_JP:Light',sans-serif] font-light leading-[20px] left-[30px] text-[#0f0f0f] text-[14px] text-center top-[6.99px] whitespace-nowrap">極細</p>
    </div>
  );
}

function SelectChip7() {
  return (
    <div className="absolute bg-[#f5f5f5] h-[35.966px] left-[67.98px] rounded-[42885100px] top-0 w-[45.991px]" data-name="SelectChip">
      <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Nunito:Light','Noto_Sans_JP:Light',sans-serif] font-light leading-[20px] left-[23px] text-[#0f0f0f] text-[14px] text-center top-[6.99px] whitespace-nowrap">細</p>
    </div>
  );
}

function SelectChip8() {
  return (
    <div className="absolute bg-[#f5f5f5] h-[35.966px] left-[121.96px] rounded-[42885100px] top-0 w-[59.99px]" data-name="SelectChip">
      <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Nunito:Light','Noto_Sans_JP:Light',sans-serif] font-light leading-[20px] left-[30px] text-[#0f0f0f] text-[14px] text-center top-[6.99px] whitespace-nowrap">中細</p>
    </div>
  );
}

function SelectChip9() {
  return (
    <div className="absolute bg-[#f5f5f5] h-[35.966px] left-[189.93px] rounded-[42885100px] top-0 w-[59.99px]" data-name="SelectChip">
      <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Nunito:Light','Noto_Sans_JP:Light',sans-serif] font-light leading-[20px] left-[30px] text-[#0f0f0f] text-[14px] text-center top-[6.99px] whitespace-nowrap">合太</p>
    </div>
  );
}

function SelectChip10() {
  return (
    <div className="absolute bg-[#f5f5f5] h-[35.966px] left-0 rounded-[42885100px] top-[43.95px] w-[59.99px]" data-name="SelectChip">
      <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Nunito:Light','Noto_Sans_JP:Light',sans-serif] font-light leading-[20px] left-[30px] text-[#0f0f0f] text-[14px] text-center top-[6.99px] whitespace-nowrap">並太</p>
    </div>
  );
}

function SelectChip11() {
  return (
    <div className="absolute bg-[#0f0f0f] drop-shadow-[0px_1px_1.5px_rgba(0,0,0,0.1),0px_1px_1px_rgba(0,0,0,0.1)] h-[35.966px] left-[67.98px] rounded-[42885100px] top-[43.95px] w-[59.99px]" data-name="SelectChip">
      <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Nunito:Light','Noto_Sans_JP:Light',sans-serif] font-light leading-[20px] left-[30px] text-[14px] text-center text-white top-[6.99px] whitespace-nowrap">極太</p>
    </div>
  );
}

function Container8() {
  return (
    <div className="h-[79.92px] relative shrink-0 w-full" data-name="Container">
      <SelectChip6 />
      <SelectChip7 />
      <SelectChip8 />
      <SelectChip9 />
      <SelectChip10 />
      <SelectChip11 />
    </div>
  );
}

function ContainerMargin2() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container (margin)">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[8px] relative size-full">
        <Container8 />
      </div>
    </div>
  );
}

function Container9() {
  return <div className="bg-[rgba(15,15,15,0.6)] relative rounded-[42885100px] shrink-0 size-[16.994px]" data-name="Container" />;
}

function Paragraph() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[137.832px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Nunito:Light','Noto_Sans_JP:Light',sans-serif] font-light leading-[16px] left-0 text-[#888] text-[12px] top-0 whitespace-nowrap">極太 — 糸の太さイメージ</p>
      </div>
    </div>
  );
}

function GaugeHint() {
  return (
    <div className="bg-[#f2f2f2] relative rounded-[18px] shrink-0 w-full" data-name="GaugeHint">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center px-[12px] py-[8px] relative size-full">
          <Container9 />
          <Paragraph />
        </div>
      </div>
    </div>
  );
}

function GaugeHintMargin() {
  return (
    <div className="relative shrink-0 w-full" data-name="GaugeHint (margin)">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center pt-[12px] relative size-full">
        <GaugeHint />
      </div>
    </div>
  );
}

function Section4() {
  return (
    <div className="h-[177.914px] relative shrink-0 w-[314.047px]" data-name="Section">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[28px] relative size-full">
        <FieldLabel4 />
        <ContainerMargin2 />
        <GaugeHintMargin />
      </div>
    </div>
  );
}

function FieldLabel5() {
  return (
    <div className="relative shrink-0 w-full" data-name="FieldLabel">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <p className="[word-break:break-word] font-['Nunito:Light','Noto_Sans_JP:Light',sans-serif] font-light leading-[16.5px] relative shrink-0 text-[#888] text-[11px] tracking-[1.1px] uppercase whitespace-nowrap">重量</p>
      </div>
    </div>
  );
}

function NumberInput() {
  return (
    <div className="bg-[#f2f2f2] h-[43.954px] relative rounded-[18px] shrink-0 w-[134.717px]" data-name="NumberInput">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-center overflow-clip p-[12px] relative rounded-[inherit] size-full">
        <p className="[word-break:break-word] font-['Nunito:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#888] text-[14px] text-center w-full">100</p>
      </div>
    </div>
  );
}

function UnitLabel() {
  return (
    <div className="h-[19.99px] relative shrink-0 w-[8.327px]" data-name="UnitLabel">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Nunito:SemiBold',sans-serif] font-semibold leading-[20px] left-0 text-[#888] text-[14px] top-[-1px] whitespace-nowrap">g</p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="absolute content-stretch flex gap-[8px] items-center left-0 top-0" data-name="Container">
      <NumberInput />
      <UnitLabel />
    </div>
  );
}

function NumberInput1() {
  return (
    <div className="bg-[#f2f2f2] h-[43.954px] relative rounded-[18px] shrink-0 w-[130.923px]" data-name="NumberInput">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-center overflow-clip p-[12px] relative rounded-[inherit] size-full">
        <p className="[word-break:break-word] font-['Nunito:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#888] text-[14px] text-center w-full">200</p>
      </div>
    </div>
  );
}

function UnitLabel1() {
  return (
    <div className="h-[19.99px] relative shrink-0 w-[12.122px]" data-name="UnitLabel">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Nunito:SemiBold',sans-serif] font-semibold leading-[20px] left-0 text-[#888] text-[14px] top-[-1px] whitespace-nowrap">m</p>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="absolute content-stretch flex gap-[8px] items-center left-[163.01px] top-0" data-name="Container">
      <NumberInput1 />
      <UnitLabel1 />
    </div>
  );
}

function Container10() {
  return (
    <div className="h-[43.954px] relative shrink-0 w-full" data-name="Container">
      <Container11 />
      <Container12 />
    </div>
  );
}

function ContainerMargin3() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container (margin)">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[8px] relative size-full">
        <Container10 />
      </div>
    </div>
  );
}

function Section5() {
  return (
    <div className="relative shrink-0 w-[314.047px]" data-name="Section">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[28px] relative size-full">
        <FieldLabel5 />
        <ContainerMargin3 />
      </div>
    </div>
  );
}

function FieldLabel6() {
  return (
    <div className="relative shrink-0 w-full" data-name="FieldLabel">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <p className="[word-break:break-word] font-['Nunito:Light','Noto_Sans_JP:Light',sans-serif] font-light leading-[16.5px] relative shrink-0 text-[#888] text-[11px] tracking-[1.1px] uppercase whitespace-nowrap">棒針</p>
      </div>
    </div>
  );
}

function NumberInput2() {
  return (
    <div className="bg-[#f2f2f2] h-[43.954px] relative rounded-[18px] shrink-0 w-[122.196px]" data-name="NumberInput">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-center overflow-clip p-[12px] relative rounded-[inherit] size-full">
        <p className="[word-break:break-word] font-['Nunito:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#888] text-[14px] text-center w-full">4</p>
      </div>
    </div>
  );
}

function UnitLabel2() {
  return (
    <div className="h-[19.99px] relative shrink-0 w-[31.692px]" data-name="UnitLabel">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Nunito:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[20px] left-0 text-[#888] text-[14px] top-[-1px] whitespace-nowrap">号 〜</p>
      </div>
    </div>
  );
}

function NumberInput3() {
  return (
    <div className="bg-[#f2f2f2] h-[43.954px] relative rounded-[18px] shrink-0 w-[122.196px]" data-name="NumberInput">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-center overflow-clip p-[12px] relative rounded-[inherit] size-full">
        <p className="[word-break:break-word] font-['Nunito:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#888] text-[14px] text-center w-full">5</p>
      </div>
    </div>
  );
}

function UnitLabel3() {
  return (
    <div className="h-[19.99px] relative shrink-0 w-[13.999px]" data-name="UnitLabel">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Nunito:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[20px] left-0 text-[#888] text-[14px] top-[-1px] whitespace-nowrap">号</p>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="Container">
      <NumberInput2 />
      <UnitLabel2 />
      <NumberInput3 />
      <UnitLabel3 />
    </div>
  );
}

function ContainerMargin4() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container (margin)">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center pt-[8px] relative size-full">
        <Container13 />
      </div>
    </div>
  );
}

function Section6() {
  return (
    <div className="relative shrink-0 w-[314.047px]" data-name="Section">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[28px] relative size-full">
        <FieldLabel6 />
        <ContainerMargin4 />
      </div>
    </div>
  );
}

function FieldLabel7() {
  return (
    <div className="relative shrink-0 w-full" data-name="FieldLabel">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <p className="[word-break:break-word] font-['Nunito:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[16.5px] relative shrink-0 text-[#888] text-[11px] tracking-[1.1px] uppercase whitespace-nowrap">かぎ針</p>
      </div>
    </div>
  );
}

function NumberInput4() {
  return (
    <div className="bg-[#f2f2f2] h-[43.954px] relative rounded-[18px] shrink-0 w-[122.196px]" data-name="NumberInput">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-center overflow-clip p-[12px] relative rounded-[inherit] size-full">
        <p className="[word-break:break-word] font-['Nunito:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#888] text-[14px] text-center w-full">5</p>
      </div>
    </div>
  );
}

function UnitLabel4() {
  return (
    <div className="h-[19.99px] relative shrink-0 w-[31.692px]" data-name="UnitLabel">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Nunito:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[20px] left-0 text-[#888] text-[14px] top-[-1px] whitespace-nowrap">号 〜</p>
      </div>
    </div>
  );
}

function NumberInput5() {
  return (
    <div className="bg-[#f2f2f2] h-[43.954px] relative rounded-[18px] shrink-0 w-[122.196px]" data-name="NumberInput">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-center overflow-clip p-[12px] relative rounded-[inherit] size-full">
        <p className="[word-break:break-word] font-['Nunito:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#888] text-[14px] text-center w-full">6</p>
      </div>
    </div>
  );
}

function UnitLabel5() {
  return (
    <div className="h-[19.99px] relative shrink-0 w-[13.999px]" data-name="UnitLabel">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Nunito:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[20px] left-0 text-[#888] text-[14px] top-[-1px] whitespace-nowrap">号</p>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="Container">
      <NumberInput4 />
      <UnitLabel4 />
      <NumberInput5 />
      <UnitLabel5 />
    </div>
  );
}

function ContainerMargin5() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container (margin)">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center pt-[8px] relative size-full">
        <Container14 />
      </div>
    </div>
  );
}

function Section7() {
  return (
    <div className="relative shrink-0 w-[314.047px]" data-name="Section">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[28px] relative size-full">
        <FieldLabel7 />
        <ContainerMargin5 />
      </div>
    </div>
  );
}

function FieldLabel8() {
  return (
    <div className="relative shrink-0 w-full" data-name="FieldLabel">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <p className="[word-break:break-word] font-['Nunito:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[16.5px] relative shrink-0 text-[#888] text-[11px] tracking-[1.1px] uppercase whitespace-nowrap">メリヤス編み標準ゲージ</p>
      </div>
    </div>
  );
}

function NumberInput6() {
  return (
    <div className="bg-[#f2f2f2] h-[43.954px] relative rounded-[18px] shrink-0 w-[131.043px]" data-name="NumberInput">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-center overflow-clip p-[12px] relative rounded-[inherit] size-full">
        <p className="[word-break:break-word] font-['Nunito:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#888] text-[14px] text-center w-full">20</p>
      </div>
    </div>
  );
}

function UnitLabel6() {
  return (
    <div className="h-[19.99px] relative shrink-0 w-[13.999px]" data-name="UnitLabel">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Nunito:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[20px] left-0 text-[#888] text-[14px] top-[-1px] whitespace-nowrap">目</p>
      </div>
    </div>
  );
}

function NumberInput7() {
  return (
    <div className="bg-[#f2f2f2] h-[43.954px] relative rounded-[18px] shrink-0 w-[131.043px]" data-name="NumberInput">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-center overflow-clip p-[12px] relative rounded-[inherit] size-full">
        <p className="[word-break:break-word] font-['Nunito:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#888] text-[14px] text-center w-full">28</p>
      </div>
    </div>
  );
}

function UnitLabel7() {
  return (
    <div className="h-[19.99px] relative shrink-0 w-[13.999px]" data-name="UnitLabel">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Nunito:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[20px] left-0 text-[#888] text-[14px] top-[-1px] whitespace-nowrap">段</p>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="Container">
      <NumberInput6 />
      <UnitLabel6 />
      <NumberInput7 />
      <UnitLabel7 />
    </div>
  );
}

function ContainerMargin6() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container (margin)">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center pt-[8px] relative size-full">
        <Container15 />
      </div>
    </div>
  );
}

function Section8() {
  return (
    <div className="relative shrink-0 w-[314.047px]" data-name="Section">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[28px] relative size-full">
        <FieldLabel8 />
        <ContainerMargin6 />
      </div>
    </div>
  );
}

function FieldLabel9() {
  return (
    <div className="relative shrink-0 w-full" data-name="FieldLabel">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <p className="[word-break:break-word] font-['Nunito:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[16.5px] relative shrink-0 text-[#888] text-[11px] tracking-[1.1px] uppercase whitespace-nowrap">個数</p>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-[#f5f5f5] relative rounded-[42885100px] shrink-0 size-[43.994px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="[word-break:break-word] font-['Nunito:Bold',sans-serif] font-bold leading-[28px] relative shrink-0 text-[#0f0f0f] text-[20px] text-center whitespace-nowrap">−</p>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="h-[35.986px] min-w-[48px] relative shrink-0 w-[48px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Nunito:Bold','Noto_Sans_JP:Regular',sans-serif] font-bold leading-[0] left-[23.99px] text-[#0f0f0f] text-[0px] text-center top-[-3.56px] whitespace-nowrap">
          <span className="leading-[36px] text-[30px]">1</span>
          <span className="font-['Nunito:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[20px] text-[#888] text-[14px]">個</span>
        </p>
      </div>
    </div>
  );
}

function Button3() {
  return (
    <div className="bg-[#f5f5f5] relative rounded-[42885100px] shrink-0 size-[43.994px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="[word-break:break-word] font-['Nunito:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold leading-[28px] relative shrink-0 text-[#0f0f0f] text-[20px] text-center whitespace-nowrap">＋</p>
      </div>
    </div>
  );
}

function QuantityStepper() {
  return (
    <div className="h-[51.994px] relative shrink-0 w-[314.047px]" data-name="QuantityStepper">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[20px] items-center pt-[8px] relative size-full">
        <Button2 />
        <Container16 />
        <Button3 />
      </div>
    </div>
  );
}

function Section9() {
  return (
    <div className="h-[96.994px] relative shrink-0 w-[314.047px]" data-name="Section">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[28px] relative size-full">
        <FieldLabel9 />
        <QuantityStepper />
      </div>
    </div>
  );
}

function FieldLabel10() {
  return (
    <div className="h-[25px] relative shrink-0 w-[314.047px]" data-name="FieldLabel">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[8px] relative size-full">
        <p className="[word-break:break-word] font-['Nunito:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[16.5px] relative shrink-0 text-[#888] text-[11px] tracking-[1.1px] uppercase whitespace-nowrap">購入日</p>
      </div>
    </div>
  );
}

function DatePicker() {
  return <div className="absolute bg-[#f2f2f2] h-[43.954px] left-0 rounded-[18px] top-[-0.01px] w-[314.047px]" data-name="Date Picker" />;
}

function XInlineContainer1() {
  return (
    <div className="h-[43.942px] relative shrink-0 w-full" data-name="x-inline-container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <DatePicker />
      </div>
    </div>
  );
}

function Section10() {
  return (
    <div className="h-[96.942px] relative shrink-0 w-[314.047px]" data-name="Section">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[28px] relative size-full">
        <FieldLabel10 />
        <XInlineContainer1 />
      </div>
    </div>
  );
}

function FieldLabel11() {
  return (
    <div className="h-[25px] relative shrink-0 w-[314.047px]" data-name="FieldLabel">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[8px] relative size-full">
        <p className="[word-break:break-word] font-['Nunito:SemiBold',sans-serif] font-semibold leading-[16.5px] relative shrink-0 text-[#888] text-[11px] tracking-[1.1px] uppercase whitespace-nowrap">URL</p>
      </div>
    </div>
  );
}

function TextInput2() {
  return (
    <div className="absolute bg-[#f2f2f2] content-stretch flex flex-col h-[43.954px] items-start justify-center left-0 overflow-clip px-[16px] py-[12px] rounded-[18px] top-[-0.01px] w-[314.047px]" data-name="TextInput">
      <p className="[word-break:break-word] font-['Nunito:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#888] text-[14px] w-full">{`https://...`}</p>
    </div>
  );
}

function XInlineContainer2() {
  return (
    <div className="h-[43.942px] relative shrink-0 w-full" data-name="x-inline-container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <TextInput2 />
      </div>
    </div>
  );
}

function Section11() {
  return (
    <div className="relative shrink-0 w-[314.047px]" data-name="Section">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[28px] relative size-full">
        <FieldLabel11 />
        <XInlineContainer2 />
      </div>
    </div>
  );
}

function FieldLabel12() {
  return (
    <div className="h-[25px] relative shrink-0 w-[314.047px]" data-name="FieldLabel">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[8px] relative size-full">
        <p className="[word-break:break-word] font-['Nunito:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[16.5px] relative shrink-0 text-[#888] text-[11px] tracking-[1.1px] uppercase whitespace-nowrap">備考</p>
      </div>
    </div>
  );
}

function TextArea() {
  return (
    <div className="absolute bg-[#f2f2f2] content-stretch flex flex-col h-[83.934px] items-start left-0 overflow-clip px-[16px] py-[12px] rounded-[18px] top-[-0.01px] w-[314.047px]" data-name="Text Area">
      <p className="[word-break:break-word] font-['Nunito:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#888] text-[14px] w-full">用途・購入場所・メモなど</p>
    </div>
  );
}

function XInlineContainer3() {
  return (
    <div className="h-[91.29px] relative shrink-0 w-full" data-name="x-inline-container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <TextArea />
      </div>
    </div>
  );
}

function Section12() {
  return (
    <div className="relative shrink-0 w-[314.047px]" data-name="Section">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[28px] relative size-full">
        <FieldLabel12 />
        <XInlineContainer3 />
      </div>
    </div>
  );
}

function Icon3() {
  return (
    <div className="relative shrink-0 size-[14.997px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.9974 14.9974">
        <g clipPath="url(#clip0_29_590)" id="Icon">
          <path d="M1.87468 3.74935H13.1227" id="Vector" stroke="var(--stroke-0, #D0182A)" strokeLinecap="round" strokeLinejoin="round" />
          <path d={svgPaths.p5fd8b00} id="Vector_2" stroke="var(--stroke-0, #D0182A)" strokeLinecap="round" strokeLinejoin="round" />
          <path d={svgPaths.p21f56180} id="Vector_3" stroke="var(--stroke-0, #D0182A)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6.24892 6.87381V10.6232" id="Vector_4" stroke="var(--stroke-0, #D0182A)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8.74848 6.87381V10.6232" id="Vector_5" stroke="var(--stroke-0, #D0182A)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <defs>
          <clipPath id="clip0_29_590">
            <rect fill="white" height="14.9974" width="14.9974" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button4() {
  return (
    <div className="relative rounded-[18px] shrink-0 w-[314.047px]" data-name="Button">
      <div aria-hidden className="absolute border-[#d0182a] border-[0.2px] border-solid inset-0 pointer-events-none rounded-[18px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center justify-center px-[0.2px] py-[12.2px] relative size-full">
        <Icon3 />
        <p className="[word-break:break-word] font-['Nunito:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[20px] relative shrink-0 text-[#d0182a] text-[14px] text-center whitespace-nowrap">この毛糸を削除する</p>
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[40px] pt-[9.278px] relative shrink-0" data-name="Container">
      <div aria-hidden className="absolute border-[rgba(0,0,0,0.08)] border-solid border-t-[1.278px] inset-0 pointer-events-none" />
      <Button4 />
    </div>
  );
}

function ContainerMargin7() {
  return (
    <div className="relative shrink-0" data-name="Container (margin)">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[28px] relative size-full">
        <Container17 />
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start px-[20px] py-[24px] relative size-full">
        <Section />
        <Section1 />
        <Section2 />
        <Section3 />
        <Section4 />
        <Section5 />
        <Section6 />
        <Section7 />
        <Section8 />
        <Section9 />
        <Section10 />
        <Section11 />
        <Section12 />
        <ContainerMargin7 />
      </div>
    </div>
  );
}

function EditScreen() {
  return (
    <div className="content-stretch flex flex-col h-[1811.218px] items-start max-w-[512px] relative shrink-0 w-[354.027px]" data-name="EditScreen">
      <Header />
      <Container1 />
    </div>
  );
}

function EditScreenMargin() {
  return (
    <div className="h-[1791px] relative shrink-0 w-full" data-name="EditScreen (margin)">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative size-full">
        <EditScreen />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start relative size-full" data-name="App">
      <EditScreenMargin />
    </div>
  );
}