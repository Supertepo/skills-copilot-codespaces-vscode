function skillsMember() {
    const member = document.querySelector('.member');
    const memberHeight = member.getBoundingClientRect().height;
    const memberTop = member.getBoundingClientRect().top;
    const memberBottom = member.getBoundingClientRect().bottom;

    if (memberTop < window.innerHeight && memberBottom > 0) {
        member.classList.add('active');
    } else {
        member.classList.remove('active');
    }
}