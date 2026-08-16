import imgImageRichmore from "./dc1d3fe4ad70cd9cf075fd6306568a876f2d54b9.png";

function ImageRichmore() {
  return (
    <div className="relative shrink-0 size-[150px]" data-name="Image (Richmore チャコール)">
      <img alt="" className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImageRichmore} />
    </div>
  );
}

function Text() {
  return (
    <div className="absolute bg-[rgba(255,247,237,0.9)] left-[120.77px] rounded-[41125700px] shadow-[0px_0px_0px_0px_#ffd6a8] top-[7.77px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <div className="[word-break:break-word] flex flex-col font-['Matangi:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 size-[20px] text-[#0f0f0f] text-[11px] text-center">
          <p className="leading-[13.75px]">2</p>
        </div>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="absolute bg-[#f2f2f2] content-stretch flex flex-col items-start left-0 overflow-clip top-0" data-name="Container">
      <ImageRichmore />
      <Text />
    </div>
  );
}

function Paragraph() {
  return (
    <div className="relative shrink-0" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="[word-break:break-word] font-['Nunito:Light',sans-serif] font-light leading-[15px] relative shrink-0 text-[#888] text-[10px] tracking-[1px] uppercase whitespace-nowrap">Richmore</p>
      </div>
    </div>
  );
}

function Text1() {
  return (
    <div className="bg-[#4a4a4a] relative rounded-[41125700px] shrink-0 size-[10px]" data-name="Text">
      <div aria-hidden className="absolute border-[1.226px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[41125700px]" />
      <div className="flex flex-row justify-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full" />
      </div>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="relative shrink-0" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip relative rounded-[inherit] size-full">
        <div className="[text-box-edge:cap_alphabetic] [text-box-trim:trim-both] [word-break:break-word] flex flex-col font-['Nunito:Light','Noto_Sans_JP:Light',sans-serif] font-light justify-end leading-[0] relative shrink-0 text-[#0f0f0f] text-[11px] whitespace-nowrap">
          <p className="leading-[17.5px]">チャコール</p>
        </div>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[6px] items-center min-w-px relative self-stretch" data-name="Container">
      <Text1 />
      <Paragraph1 />
    </div>
  );
}

function ContainerMargin() {
  return (
    <div className="h-[10px] relative shrink-0 w-[88px]" data-name="Container (margin)">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start justify-center relative size-full">
        <Container2 />
      </div>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="relative shrink-0" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip relative rounded-[inherit] size-full">
        <div className="[word-break:break-word] flex flex-col font-['Nunito:Light','Noto_Sans_JP:Light',sans-serif] font-light justify-center leading-[0] relative shrink-0 text-[#0f0f0f] text-[10px] whitespace-nowrap">
          <p className="leading-[17.5px]">在庫　2個</p>
        </div>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center min-w-px relative self-stretch" data-name="Container">
      <Paragraph2 />
    </div>
  );
}

function ContainerMargin1() {
  return (
    <div className="h-[18px] relative shrink-0 w-[88px]" data-name="Container (margin)">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start justify-center relative size-full">
        <Container3 />
      </div>
    </div>
  );
}

function Tag() {
  return (
    <div className="bg-[#f2f2f2] h-full relative rounded-[41125700px] shrink-0" data-name="Tag">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center p-[4px] relative size-full">
          <p className="[word-break:break-word] font-['Nunito:Light','Noto_Sans_JP:Light',sans-serif] font-light leading-[16.5px] relative shrink-0 text-[#888] text-[9px] tracking-[0.275px] whitespace-nowrap">メリノウール</p>
        </div>
      </div>
    </div>
  );
}

function Tag1() {
  return (
    <div className="bg-[#f2f2f2] h-full relative rounded-[41125700px] shrink-0" data-name="Tag">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center p-[4px] relative size-full">
          <p className="[word-break:break-word] font-['Nunito:Light','Noto_Sans_JP:Light',sans-serif] font-light leading-[16.5px] relative shrink-0 text-[#888] text-[9px] tracking-[0.275px] whitespace-nowrap">極太</p>
        </div>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[10px] h-[25px] items-center min-w-px relative" data-name="Container">
      <div className="flex flex-row items-center self-stretch">
        <Tag />
      </div>
      <div className="flex flex-row items-center self-stretch">
        <Tag1 />
      </div>
    </div>
  );
}

function ContainerMargin2() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container (margin)">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <Container4 />
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col gap-[10px] h-[140px] items-start left-[0.32px] px-[20px] py-[25px] right-[-1.23px] rounded-tl-[30px] rounded-tr-[30px] top-[120.77px]" data-name="Container">
      <Paragraph />
      <ContainerMargin />
      <ContainerMargin1 />
      <ContainerMargin2 />
    </div>
  );
}

export default function YarnCard() {
  return (
    <div className="bg-white border-[1.226px] border-[rgba(0,0,0,0.08)] border-solid overflow-clip relative rounded-[30px] size-full" data-name="YarnCard">
      <Container />
      <Container1 />
    </div>
  );
}